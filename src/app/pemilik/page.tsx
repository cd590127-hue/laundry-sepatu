'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, rupiah } from '@/lib/store';

const menus = [
  { href: '/pemilik/pelanggan', label: 'Data Pelanggan' },
  { href: '/pemilik/laporan', label: 'Laporan' },
];

export default function PemilikDashboard() {
  const { user, ready } = useAuth('pemilik');
  const [stats, setStats] = useState({ pelanggan: 0, pesanan: 0, omzet: 0, laporan: 0 });

  useEffect(() => {
    const db = getDB();
    setStats({
      pelanggan: db.users.filter((u) => u.role === 'pelanggan').length,
      pesanan: db.pesanan.length,
      omzet: db.pesanan.filter((p) => p.pembayaran?.status === 'lunas').reduce((s, p) => s + p.total, 0),
      laporan: db.laporan.length,
    });
  }, []);

  if (!ready || !user) return null;

  return (
    <DashboardLayout user={user} menus={menus} title="Dashboard Pemilik">
      <h2 className="text-2xl font-bold mb-2">Dashboard Pemilik</h2>
      <p className="text-gray-500 mb-8">Pantau data pelanggan dan laporan usaha.</p>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Pelanggan</p>
          <p className="text-3xl font-bold text-sky-600">{stats.pelanggan}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Pesanan</p>
          <p className="text-3xl font-bold text-blue-600">{stats.pesanan}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Omzet</p>
          <p className="text-2xl font-bold text-green-600">{rupiah(stats.omzet)}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Laporan Tersedia</p>
          <p className="text-3xl font-bold text-gray-700">{stats.laporan}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/pemilik/pelanggan" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">👥</p>
          <p className="font-bold">Data Pelanggan</p>
          <p className="text-sm text-gray-500">Cari pelanggan & lihat riwayat pesanannya</p>
        </Link>
        <Link href="/pemilik/laporan" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">📊</p>
          <p className="font-bold">Laporan</p>
          <p className="text-sm text-gray-500">Lihat, unduh, dan cetak laporan usaha</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
