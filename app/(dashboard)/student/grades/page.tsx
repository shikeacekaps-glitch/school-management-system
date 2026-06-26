'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Grade {
  id: string;
  class_id: string;
  percentage?: number;
  grade_letter?: string;
  comments?: string;
}

interface ClassInfo {
  id: string;
  name: string;
}

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<(Grade & { class?: ClassInfo })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch class info for each grade
        const gradesWithClasses = await Promise.all(
          (data as Grade[])?.map(async (grade) => {
            const { data: classData } = await supabase
              .from('classes')
              .select('id, name')
              .eq('id', grade.class_id)
              .single();
            return { ...grade, class: classData };
          }) || []
        );

        setGrades(gradesWithClasses);
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
      <h1 className="text-3xl font-bold mb-8">My Grades</h1>

      {grades.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No grades recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Class</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Percentage</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Letter Grade</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Comments</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{grade.class?.name || 'Unknown'}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${grade.percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{grade.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {grade.grade_letter || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm">{grade.comments || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}