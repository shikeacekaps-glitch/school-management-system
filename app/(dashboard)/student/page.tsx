'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Class {
  id: string;
  name: string;
  code: string;
  grade_level: string;
  capacity: number;
  status: string;
  room_number: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    averageGrade: 0,
    pendingAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'student') return;

      try {
        // Fetch enrolled classes
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('class_id')
          .eq('student_id', user.id);

        if (!enrollments || enrollments.length === 0) {
          setLoading(false);
          return;
        }

        const classIds = enrollments.map((e) => e.class_id);

        // Fetch class details
        const { data: enrolledClasses } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds);

        setClasses((enrolledClasses as Class[]) || []);

        // Fetch student grades
        const { data: grades } = await supabase
          .from('grades')
          .select('percentage')
          .eq('student_id', user.id);

        const avgGrade = grades && grades.length > 0
          ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
          : 0;

        // Fetch pending assignments
        const { count: pendingCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('status', 'published')
          .gt('due_date', new Date().toISOString());

        setStats({
          totalClasses: enrolledClasses?.length || 0,
          averageGrade: avgGrade,
          pendingAssignments: pendingCount || 0,
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
      <h1 className="text-4xl font-bold mb-8">Student Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">My Classes</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalClasses}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Grade</h3>
          <p className="text-3xl font-bold text-green-600">{stats.averageGrade}%</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Assignments</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingAssignments}</p>
        </div>
      </div>

      {/* My Classes */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Classes</h2>
          <Link href="/dashboard/student/classes" className="text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>

        {classes.length === 0 ? (
          <p className="text-gray-600">You are not enrolled in any classes yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/dashboard/student/classes/${cls.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{cls.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{cls.code}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Grade {cls.grade_level}</span>
                  <span>{cls.room_number}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}