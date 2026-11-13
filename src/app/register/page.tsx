'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register, login } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const [peran, setPeran] = useState<'pelanggan' | 'pemilik'>('pelanggan');
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '', telepon: '', alamat: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.konfirmasi) {
      setError('Konfirmasi password tidak sama');
      return;
    }
    const res = register({
      nama: form.nama,
      email: form.email,
      password: form.password,
      telepon: form.telepon,
      alamat: form.alamat,
      role: peran,
    });
    if (!res.ok) {
      setError(res.error!);
      return;
    }
    login(form.email, form.password);
    router.push(`/${res.user!.role}`);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center"><span className="text-sky-600">Laundry</span> Sepatu</h1>
        <p className="text-center text-gray-500 mt-1 mb-6">Registrasi akun baru</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {(['pelanggan', 'pemilik'] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPeran(p)} className={`py-2 rounded-lg border text-sm font-semibold capitalize ${peran === p ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 text-gray-600 hover:border-sky-400'}`}>
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input required value={form.nama} onChange={set('nama')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={set('email')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
            <input required value={form.telepon} onChange={set('telepon')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea required value={form.alamat} onChange={set('alamat')} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={set('password')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <input type="password" required value={form.konfirmasi} onChange={set('konfirmasi')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg">Daftar</button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Sudah punya akun? <Link href="/login" className="text-sky-600 font-semibold">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
