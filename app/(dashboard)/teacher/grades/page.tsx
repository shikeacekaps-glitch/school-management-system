'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Grade {
  id: string;
  student_id: string;
  percentage?: number;
  grade_letter?: string;
  comments?: string;
}

interface StudentInfo {
  id: string;
  full_name: string;
}

export default function TeacherGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<(Grade & { student?: StudentInfo })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user) return;

      try {
        // Get teacher's classes
        const { data: classes } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', user.id);

        if (!classes || classes.length === 0) {
          setLoading(false);
          return;
        }

        const classIds = classes.map((c) => c.id);

        // Get grades for those classes
        const { data } = await supabase
          .from('grades')
          .select('*')
          .in('class_id', classIds)
          .order('created_at', { ascending: false });

        // Fetch student info for each grade
        const gradesWithStudents = await Promise.all(
          (data as Grade[])?.map(async (grade) => {
            const { data: studentData } = await supabase
              .from('users')
              .select('id, full_name')
              .eq('id', grade.student_id)
              .single();
            return { ...grade, student: studentData };
          }) || []
        );

        setGrades(gradesWithStudents);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Grades</h1>

      {grades.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No grades recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Percentage</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Letter Grade</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Comments</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{grade.student?.full_name || 'Unknown'}</td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold">{grade.percentage}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      {grade.grade_letter || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm">{grade.comments || '-'}</td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}