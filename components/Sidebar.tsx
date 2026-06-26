'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ROLE_ROUTES = {
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Schools', href: '/dashboard/admin/schools' },
  ],
  teacher: [
    { label: 'Dashboard', href: '/dashboard/teacher' },
    { label: 'My Classes', href: '/dashboard/teacher/classes' },
    { label: 'Assignments', href: '/dashboard/teacher/assignments' },
    { label: 'Grades', href: '/dashboard/teacher/grades' },
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard/student' },
    { label: 'My Classes', href: '/dashboard/student/classes' },
    { label: 'Assignments', href: '/dashboard/student/assignments' },
    { label: 'Grades', href: '/dashboard/student/grades' },
  ],
  parent: [
    { label: 'Dashboard', href: '/dashboard/parent' },
    { label: 'Children', href: '/dashboard/parent/children' },
    { label: 'Grades', href: '/dashboard/parent/grades' },
  ],
};

export const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const routes = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] || [];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 pt-20 overflow-y-auto">
      <nav className="p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`block px-4 py-2 rounded-lg mb-2 transition-colors ${
              pathname === route.href
                ? 'bg-blue-600'
                : 'hover:bg-gray-800'
            }`}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}