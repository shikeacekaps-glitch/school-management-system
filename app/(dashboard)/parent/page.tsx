'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Child {
  id: string;
  full_name: string;
  email: string;
}

interface ClassData {
  id: string;
  name: string;
  code: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    enrolledClasses: 0,
    averageGrade: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'parent') return;

      try {
        // Fetch parent's children
        const { data: parentStudents } = await supabase
          .from('parent_student')
          .select('student_id')
          .eq('parent_id', user.id);

        if (!parentStudents || parentStudents.length === 0) {
          setLoading(false);
          return;
        }

        const studentIds = parentStudents.map((ps) => ps.student_id);

        // Fetch student details
        const { data: studentDetails } = await supabase
          .from('users')
          .select('id, full_name, email')
          .in('id', studentIds);

        setChildren((studentDetails as Child[]) || []);

        // Fetch enrolled classes
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('class_id')
          .in('student_id', studentIds);

        const classIds = enrollments?.map((e) => e.class_id) || [];

        // Fetch grades
        const { data: grades } = await supabase
          .from('grades')
          .select('percentage')
          .in('student_id', studentIds);

        const avgGrade = grades && grades.length > 0
          ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
          : 0;

        setStats({
          totalChildren: studentDetails?.length || 0,
          enrolledClasses: new Set(classIds).size,
          averageGrade: avgGrade,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Parent Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">My Children</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalChildren}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Enrolled Classes</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.enrolledClasses}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Children's Average Grade</h3>
          <p className="text-3xl font-bold text-green-600">{stats.averageGrade}%</p>
        </div>
      </div>

      {/* My Children */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Children</h2>
          <Link href="/dashboard/parent/children" className="text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>

        {children.length === 0 ? (
          <p className="text-gray-600">No children linked to your account</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/dashboard/parent/children/${child.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-1">{child.full_name}</h3>
                <p className="text-sm text-gray-600">{child.email}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}