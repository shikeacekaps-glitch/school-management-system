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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'teacher') return;

      try {
        // Fetch teacher's classes
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);

        setClasses((teacherClasses as Class[]) || []);

        // Fetch stats
        const { count: assignmentsCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id);

        let totalStudents = 0;
        if (teacherClasses && teacherClasses.length > 0) {
          for (const cls of teacherClasses) {
            const { count } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id);
            totalStudents += count || 0;
          }
        }

        setStats({
          totalClasses: teacherClasses?.length || 0,
          totalStudents,
          totalAssignments: assignmentsCount || 0,
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
      <h1 className="text-4xl font-bold mb-8">Teacher Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">My Classes</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalClasses}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Assignments Created</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalAssignments}</p>
        </div>
      </div>

      {/* My Classes */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Classes</h2>
          <Link href="/dashboard/teacher/classes" className="text-blue-600 hover:text-blue-700">
            Manage →
          </Link>
        </div>

        {classes.length === 0 ? (
          <p className="text-gray-600">No classes assigned yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/dashboard/teacher/classes/${cls.id}`}
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