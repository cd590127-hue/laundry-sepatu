'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB } from '@/lib/store';

const menus = [
  { href: '/pelanggan/profil', label: 'Data Pelanggan' },
  { href: '/pelanggan/pesan', label: 'Pesan Laundry' },
  { href: '/pelanggan/bayar', label: 'Pembayaran' },
];

export default function ProfilPage() {
  const { user, ready } = useAuth('pelanggan');
  const [form, setForm] = useState({ nama: '', email: '', telepon: '', alamat: '', password: '' });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; teks: string } | null>(null);

  if (ready && user && !loaded) {
    setForm({ nama: user.nama, email: user.email, telepon: user.telepon, alamat: user.alamat, password: user.password });
    setLoaded(true);
  }

  if (!ready || !user) return null;

  const valid = form.nama.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && form.telepon.trim() && form.alamat.trim() && form.password.length >= 6;

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDB();
    if (db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === form.email.toLowerCase())) {
      setMsg({ ok: false, teks: 'Email sudah digunakan akun lain' });
      return;
    }
    const idx = db.users.findIndex((u) => u.id === user.id);
    db.users[idx] = { ...db.users[idx], ...form };
    saveDB(db);
    setMsg({ ok: true, teks: 'Data pelanggan berhasil disimpan' });
    setTimeout(() => window.location.reload(), 800);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <DashboardLayout user={user} menus={menus} title="Data Pelanggan">
      <h2 className="text-2xl font-bold mb-6">Data Pelanggan</h2>
      <form onSubmit={handleSimpan} className="max-w-lg bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input value={form.nama} onChange={set('nama')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
          <input value={form.telepon} onChange={set('telepon')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
          <textarea value={form.alamat} onChange={set('alamat')} rows={3} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={form.password} onChange={set('password')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        {msg && <p className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>{msg.teks}</p>}
        <button type="submit" disabled={!valid} className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-lg">
          Simpan Data
        </button>
        {!valid && <p className="text-xs text-gray-400">Lengkapi data dengan benar untuk menyimpan (password min. 6 karakter).</p>}
      </form>
    </DashboardLayout>
  );
}
