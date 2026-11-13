'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDB, rupiah, formatTanggal, currentUser, Layanan, Ulasan } from '@/lib/store';

export default function LandingPage() {
  const router = useRouter();
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [tab, setTab] = useState<'semua' | 'utama' | 'addon'>('semua');
  const [user, setUser] = useState<ReturnType<typeof currentUser>>(null);

  useEffect(() => {
    const db = getDB();
    setLayanan(db.layanan);
    setUlasan(db.ulasan);
    setUser(currentUser());
  }, []);

  const utama = layanan.filter((l) => l.kategori === 'utama');
  const addon = layanan.filter((l) => l.kategori === 'addon');
  const filtered = tab === 'semua' ? layanan : tab === 'utama' ? utama : addon;
  const avgRating = ulasan.length ? (ulasan.reduce((s, u) => s + u.rating, 0) / ulasan.length).toFixed(1) : '0';

  const handlePesan = () => {
    if (user) router.push(`/${user.role}`);
    else router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold"><span className="text-sky-600">Laundry</span> Sepatu</span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#layanan" className="hover:text-sky-600">Layanan</a>
            <a href="#ulasan" className="hover:text-sky-600">Ulasan</a>
            <a href="#kontak" className="hover:text-sky-600">Kontak</a>
            {user ? (
              <Link href={`/${user.role}`} className="text-sky-600 border border-sky-600 rounded-lg px-4 py-2 hover:bg-sky-50">Dashboard</Link>
            ) : (
              <Link href="/login" className="text-sky-600 border border-sky-600 rounded-lg px-4 py-2 hover:bg-sky-50">Masuk</Link>
            )}
          </div>
          <Link href={user ? `/${user.role}` : '/login'} className="md:hidden text-sky-600 font-semibold text-sm">
            {user ? 'Dashboard' : 'Masuk'}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold">Laundry Sepatu <span className="text-yellow-400">★★★★★</span> <span className="text-lg font-normal text-gray-500">{avgRating} ({ulasan.length})</span></h1>
        <div className="mt-6 rounded-2xl overflow-hidden relative min-h-[320px] md:min-h-[400px] flex items-center">
          <img src="/images/hero.jpg" alt="Sepatu bersih setelah laundry" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative text-white p-8 md:p-12">
            <p className="text-3xl md:text-5xl font-extrabold tracking-wide">PROMO <span className="text-sky-500">Laundry Sepatu</span></p>
            <p className="mt-3 text-gray-200 max-w-xl">Sepatu bersih maksimal, pengerjaan rapi dan cepat. Cuci Standart mulai {rupiah(70000)}, Premium mulai {rupiah(100000)}.</p>
            <button onClick={handlePesan} className="mt-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl">
              Pesan Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Layanan unggulan - gaya katalog gambar */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6">Layanan Kami</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { img: '/images/refresh-care.jpg', nama: 'Refresh Care', desk: 'Pembersihan instan untuk bagian upper, midsole, dan outsole.', harga: 70000 },
            { img: '/images/deep-cleaning.jpg', nama: 'Deep Cleaning', desk: 'Pembersihan menyeluruh untuk sepatu kesayangan kamu.', harga: 100000 },
            { img: '/images/unyellowing.jpg', nama: 'Unyellowing', desk: 'Menghilangkan efek menguning pada midsole atau outsole.', harga: 80000 },
            { img: '/images/boost-whitening.jpg', nama: 'Boost Whitening', desk: 'Memutihkan kembali sepatu putih yang kusam.', harga: 50000 },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img src={s.img} alt={s.nama} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-4">
                <p className="font-bold">{s.nama}</p>
                <p className="text-sm text-gray-500 mt-1 min-h-[40px]">{s.desk}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-sky-600">Mulai {rupiah(s.harga)}</p>
                  <button onClick={handlePesan} className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold hover:bg-sky-700">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricelist */}
      <section id="layanan" className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex gap-2 mb-6">
          {([['semua', 'Semua'], ['utama', 'Pricelist Laundry Sepatu'], ['addon', 'Add on']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-full text-sm font-medium border ${tab === key ? 'bg-sky-600 text-white border-sky-600' : 'border-sky-600 text-sky-600 hover:bg-sky-50'}`}>
              {label}
            </button>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">Pricelist Laundry Sepatu</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-sky-50 rounded-2xl p-6 divide-y divide-sky-100">
            {filtered.map((l) => (
              <div key={l.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold">{l.nama}</p>
                  <p className="text-sm text-gray-500">{l.deskripsi}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-sky-600">{rupiah(l.harga)}</span>
                  <button onClick={handlePesan} className="w-8 h-8 rounded-full border-2 border-sky-600 text-sky-600 font-bold hover:bg-sky-600 hover:text-white">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 h-fit">
            <div className="rounded-2xl overflow-hidden h-40 md:h-48">
              <img src="/images/premium.jpg" alt="Layanan premium" className="w-full h-full object-cover" />
            </div>
            <div id="kontak" className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-lg">Jadwalkan Laundry Kamu!</h3>
              <p className="text-sm text-gray-500">Hubungi kami untuk jadwal pemesanan</p>
              <div className="text-sm space-y-3">
                <p className="flex gap-2"><span>📍</span> Jl. Ceger Raya No.42, Jurang Mangu Barat, Kec. Pd. Aren, Kota Tangerang Selatan, Banten 15222</p>
                <p className="flex gap-2"><span>📞</span> 081266100500</p>
                <p className="flex gap-2"><span>✉️</span> info@laundrysepatu.id</p>
                <p className="flex gap-2"><span>🕘</span> 09:00–20:00 (Weekday) &amp; 09:00–17:00 (Weekend)</p>
              </div>
              <button onClick={handlePesan} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl">
                🛒 Pesan Laundry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ulasan */}
      <section id="ulasan" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Ulasan Pelanggan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-sky-50 rounded-2xl p-6 text-center h-fit">
            <p className="text-5xl font-bold text-sky-600">{avgRating}</p>
            <p className="text-yellow-400 text-xl mt-1">★★★★★</p>
            <p className="text-sm text-gray-500 mt-1">Berdasarkan {ulasan.length} ulasan</p>
          </div>
          <div className="md:col-span-2 divide-y">
            {ulasan.map((u) => (
              <div key={u.id} className="py-4 first:pt-0 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 font-bold flex items-center justify-center shrink-0">
                  {u.nama.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{u.nama}</p>
                    <span className="text-xs text-gray-400">{formatTanggal(u.tanggal)}</span>
                  </div>
                  <p className="text-yellow-400 text-sm">{'★'.repeat(u.rating)} <span className="text-gray-500">{u.rating.toFixed(1)}</span></p>
                  <p className="text-sm text-gray-600 mt-1">{u.teks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © 2025 Laundry Sepatu — Sistem Informasi Laundry Sepatu
      </footer>
    </div>
  );
}
