'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB } from '@/lib/store';
import { useEffect, useState } from 'react';

const menus = [
  { href: '/pelanggan/profil', label: 'Data Pelanggan' },
  { href: '/pelanggan/pesan', label: 'Pesan Laundry' },
  { href: '/pelanggan/bayar', label: 'Pembayaran' },
];

export default function PelangganDashboard() {
  const { user, ready } = useAuth('pelanggan');
  const [stats, setStats] = useState({ total: 0, aktif: 0, tagihan: 0 });

  useEffect(() => {
    if (!user) return;
    const db = getDB();
    const mine = db.pesanan.filter((p) => p.pelangganId === user.id);
    setStats({
      total: mine.length,
      aktif: mine.filter((p) => ['diterima', 'diproses'].includes(p.status)).length,
      tagihan: mine.filter((p) => !p.pembayaran || ['belum_bayar', 'ditolak'].includes(p.pembayaran.status)).length,
    });
  }, [user]);

  if (!ready || !user) return null;

  return (
    <DashboardLayout user={user} menus={menus} title="Dashboard Pelanggan">
      <h2 className="text-2xl font-bold mb-2">Selamat datang, {user.nama}!</h2>
      <p className="text-gray-500 mb-8">Pilih menu di bawah untuk mulai.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Pesanan</p>
          <p className="text-3xl font-bold text-sky-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Sedang Diproses</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.aktif}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Tagihan Belum Lunas</p>
          <p className="text-3xl font-bold text-red-500">{stats.tagihan}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/pelanggan/profil" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">👤</p>
          <p className="font-bold">Data Pelanggan</p>
          <p className="text-sm text-gray-500">Kelola data diri Anda</p>
        </Link>
        <Link href="/pelanggan/pesan" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">👟</p>
          <p className="font-bold">Pesan Laundry</p>
          <p className="text-sm text-gray-500">Buat pesanan cuci sepatu baru</p>
        </Link>
        <Link href="/pelanggan/bayar" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">💳</p>
          <p className="font-bold">Pembayaran</p>
          <p className="text-sm text-gray-500">Bayar tagihan & lihat kwitansi</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
