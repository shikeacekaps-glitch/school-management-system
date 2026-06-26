'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  total_points: number;
}

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;

      try {
        // Get student's enrolled classes
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('class_id')
          .eq('student_id', user.id);

        if (!enrollments || enrollments.length === 0) {
          setLoading(false);
          return;
        }

        const classIds = enrollments.map((e) => e.class_id);

        // Get assignments for those classes
        const { data } = await supabase
          .from('assignments')
          .select('*')
          .in('class_id', classIds)
          .eq('status', 'published')
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

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Assignments</h1>

      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="card border-l-4 border-blue-600">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{assignment.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isOverdue(assignment.due_date)
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isOverdue(assignment.due_date) ? 'Overdue' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </span>
                <button className="btn-primary text-sm">
                  Submit Assignment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}