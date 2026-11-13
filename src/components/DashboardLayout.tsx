'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout, User } from '@/lib/store';

interface MenuItem {
  href: string;
  label: string;
}

export default function DashboardLayout({
  user,
  menus,
  title,
  children,
}: {
  user: User;
  menus: MenuItem[];
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-sky-600 text-white shadow print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Laundry Sepatu</h1>
            <p className="text-sky-100 text-sm">{title} — {user.nama}</p>
          </div>
          <button onClick={handleLogout} className="bg-white text-sky-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-50">
            Keluar
          </button>
        </div>
      </header>
      <nav className="bg-white border-b shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {menus.map((m) => (
            <Link key={m.href} href={m.href} className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-sky-600 hover:border-b-2 hover:border-sky-600 whitespace-nowrap">
              {m.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
