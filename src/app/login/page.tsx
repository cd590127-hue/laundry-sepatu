'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(email, password);
    if (!u) {
      setError('Email atau password salah');
      return;
    }
    router.push(`/${u.role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center"><span className="text-sky-600">Laundry</span> Sepatu</h1>
        <p className="text-center text-gray-500 mt-1 mb-6">Masuk ke akun Anda</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="email@contoh.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg">Masuk</button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Belum punya akun? <Link href="/register" className="text-sky-600 font-semibold">Daftar di sini</Link>
        </p>
        <p className="text-sm text-center mt-1">
          <Link href="/" className="text-gray-400 hover:text-sky-600">← Kembali ke beranda</Link>
        </p>

        <div className="mt-6 border-t pt-4 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-500">Akun demo:</p>
          <p>Pelanggan: fredi@mail.com / fredi123</p>
          <p>Admin: admin@laundry.id / admin123</p>
          <p>Pemilik: pemilik@laundry.id / pemilik123</p>
        </div>
      </div>
    </div>
  );
}
