'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  total_points: number;
}

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('assignments')
          .select('*')
          .eq('teacher_id', user.id)
          .order('due_date', { ascending: true });

        setAssignments((data as Assignment[]) || []);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <button className="btn-primary">
          Create Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No assignments created yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Points</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{assignment.title}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">{assignment.total_points}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      assignment.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Delete
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