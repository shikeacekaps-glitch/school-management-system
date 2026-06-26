'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Class {
  id: string;
  name: string;
  code: string;
  grade_level: string;
  capacity: number;
  status: string;
  room_number: string;
}

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        setClasses((data as Class[]) || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Classes</h1>

      {classes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">You have not been assigned any classes yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Class Name</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Code</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Grade Level</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Room</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{cls.name}</td>
                  <td className="py-4 px-6 text-gray-600">{cls.code}</td>
                  <td className="py-4 px-6 text-gray-600">{cls.grade_level}</td>
                  <td className="py-4 px-6 text-gray-600">{cls.room_number}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cls.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cls.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
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