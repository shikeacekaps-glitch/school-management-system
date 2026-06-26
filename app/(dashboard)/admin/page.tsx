'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClassData {
  id: string;
  name: string;
  code: string;
  grade_level: string;
  capacity: number;
  status: string;
  room_number: string;
  description?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [recentClasses, setRecentClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', user.school_id);

        // Fetch total classes
        const { count: classesCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', user.school_id);

        // Fetch total students
        const { count: studentsCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', user.school_id)
          .eq('role', 'student');

        // Fetch total teachers
        const { count: teachersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', user.school_id)
          .eq('role', 'teacher');

        // Fetch recent classes
        const { data: classes } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', user.school_id)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalUsers: usersCount || 0,
          totalClasses: classesCount || 0,
          totalStudents: studentsCount || 0,
          totalTeachers: teachersCount || 0,
        });

        setRecentClasses((classes as ClassData[]) || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Classes</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalClasses}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Teachers</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.totalTeachers}</p>
        </div>
      </div>

      {/* Recent Classes */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Classes</h2>
          <Link href="/dashboard/admin/classes" className="text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>

        {recentClasses.length === 0 ? (
          <p className="text-gray-600">No classes yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 font-semibold">Class</th>
                  <th className="text-left py-2 font-semibold">Code</th>
                  <th className="text-left py-2 font-semibold">Grade Level</th>
                  <th className="text-left py-2 font-semibold">Capacity</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClasses.map((cls) => (
                  <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{cls.name}</td>
                    <td className="py-3">{cls.code}</td>
                    <td className="py-3">{cls.grade_level}</td>
                    <td className="py-3">{cls.capacity}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cls.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cls.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}