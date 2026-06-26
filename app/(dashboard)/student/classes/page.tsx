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

export default function StudentClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        // Get enrolled classes
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('class_id')
          .eq('student_id', user.id);

        if (!enrollments || enrollments.length === 0) {
          setLoading(false);
          return;
        }

        const classIds = enrollments.map((e) => e.class_id);

        const { data } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds)
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
          <p className="text-gray-600 text-lg">You are not enrolled in any classes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="card">
              <h3 className="text-xl font-bold mb-2">{cls.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{cls.code}</p>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><span className="font-medium">Grade Level:</span> {cls.grade_level}</p>
                <p><span className="font-medium">Room:</span> {cls.room_number}</p>
              </div>
              <button className="w-full btn-primary text-sm">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}