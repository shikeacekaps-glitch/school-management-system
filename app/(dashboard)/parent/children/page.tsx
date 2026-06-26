'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Child {
  id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
}

interface Grade {
  percentage?: number;
  grade_letter?: string;
}

export default function ParentChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<(Child & { averageGrade?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user || user.role !== 'parent') return;

      try {
        // Get parent's children
        const { data: parentStudents } = await supabase
          .from('parent_student')
          .select('student_id')
          .eq('parent_id', user.id);

        if (!parentStudents || parentStudents.length === 0) {
          setLoading(false);
          return;
        }

        const studentIds = parentStudents.map((ps) => ps.student_id);

        // Get student details
        const { data: studentDetails } = await supabase
          .from('users')
          .select('id, full_name, email, date_of_birth')
          .in('id', studentIds);

        // Get grades for each student
        const childrenWithGrades = await Promise.all(
          (studentDetails as Child[])?.map(async (child) => {
            const { data: grades } = await supabase
              .from('grades')
              .select('percentage')
              .eq('student_id', child.id);

            const avgGrade = grades && grades.length > 0
              ? Math.round(grades.reduce((sum, g: Grade) => sum + (g.percentage || 0), 0) / grades.length)
              : 0;

            return { ...child, averageGrade: avgGrade };
          }) || []
        );

        setChildren(childrenWithGrades);
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Children</h1>

      {children.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No children linked to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <div key={child.id} className="card">
              <h3 className="text-2xl font-bold mb-2">{child.full_name}</h3>
              <p className="text-gray-600 mb-4">{child.email}</p>
              <div className="space-y-3 mb-6">
                {child.date_of_birth && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">DOB:</span> {new Date(child.date_of_birth).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Average Grade:</span> 
                  <span className="ml-2 text-lg font-bold text-green-600">{child.averageGrade}%</span>
                </p>
              </div>
              <button className="w-full btn-primary text-sm">
                View Detailed Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}