'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, rupiah } from '@/lib/store';

const menus = [
  { href: '/admin/transaksi', label: 'Daftar Transaksi' },
  { href: '/admin/master', label: 'Kelola Data Master' },
  { href: '/admin/laporan', label: 'Kelola Laporan' },
];

export default function AdminDashboard() {
  const { user, ready } = useAuth('admin');
  const [stats, setStats] = useState({ pesananAktif: 0, verifikasi: 0, omzet: 0, pelanggan: 0 });

  useEffect(() => {
    const db = getDB();
    setStats({
      pesananAktif: db.pesanan.filter((p) => ['diterima', 'diproses'].includes(p.status)).length,
      verifikasi: db.pesanan.filter((p) => p.pembayaran?.status === 'menunggu_verifikasi').length,
      omzet: db.pesanan.filter((p) => p.pembayaran?.status === 'lunas').reduce((s, p) => s + p.total, 0),
      pelanggan: db.users.filter((u) => u.role === 'pelanggan').length,
    });
  }, []);

  if (!ready || !user) return null;

  return (
    <DashboardLayout user={user} menus={menus} title="Dashboard Admin">
      <h2 className="text-2xl font-bold mb-2">Dashboard Admin</h2>
      <p className="text-gray-500 mb-8">Kelola operasional laundry sepatu.</p>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Pesanan Aktif</p>
          <p className="text-3xl font-bold text-blue-600">{stats.pesananAktif}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Menunggu Verifikasi Bayar</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.verifikasi}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Omzet (Lunas)</p>
          <p className="text-2xl font-bold text-green-600">{rupiah(stats.omzet)}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Pelanggan</p>
          <p className="text-3xl font-bold text-sky-600">{stats.pelanggan}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/admin/transaksi" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-bold">Daftar Transaksi</p>
          <p className="text-sm text-gray-500">Ubah status pesanan & verifikasi pembayaran</p>
        </Link>
        <Link href="/admin/master" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">🗂️</p>
          <p className="font-bold">Kelola Data Master</p>
          <p className="text-sm text-gray-500">Layanan, bahan/model sepatu, jenis pembayaran</p>
        </Link>
        <Link href="/admin/laporan" className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-sky-400 transition">
          <p className="text-3xl mb-2">📊</p>
          <p className="font-bold">Kelola Laporan</p>
          <p className="text-sm text-gray-500">Laporan pemesanan, keuangan, pelanggan</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
