'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BadgePesanan, BadgeBayar } from '@/components/Badges';
import { useAuth } from '@/lib/useAuth';
import { getDB, rupiah, formatTanggal, User, Pesanan } from '@/lib/store';

const menus = [
  { href: '/pemilik/pelanggan', label: 'Data Pelanggan' },
  { href: '/pemilik/laporan', label: 'Laporan' },
];

export default function PemilikPelangganPage() {
  const { user, ready } = useAuth('pemilik');
  const [keyword, setKeyword] = useState('');
  const [pelanggan, setPelanggan] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [riwayat, setRiwayat] = useState<Pesanan[]>([]);
  const [dicari, setDicari] = useState(false);

  useEffect(() => {
    const db = getDB();
    setPelanggan(db.users.filter((u) => u.role === 'pelanggan'));
  }, []);

  if (!ready || !user) return null;

  const hasil = keyword.trim()
    ? pelanggan.filter((p) => p.nama.toLowerCase().includes(keyword.toLowerCase()) || p.telepon.includes(keyword.trim()))
    : pelanggan;

  const handleDetail = (p: User) => {
    const db = getDB();
    setSelected(p);
    setRiwayat(db.pesanan.filter((x) => x.pelangganId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  return (
    <DashboardLayout user={user} menus={menus} title="Data Pelanggan">
      <h2 className="text-2xl font-bold mb-6">Data Pelanggan</h2>

      {!selected ? (
        <>
          <div className="flex gap-2 mb-4 max-w-lg">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari berdasarkan nama atau no. telepon..."
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button onClick={() => setDicari(true)} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-lg">Cari</button>
          </div>

          {dicari && hasil.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Pelanggan tidak ditemukan</div>
          ) : (
            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Telepon</th>
                    <th className="px-4 py-3">Terdaftar</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hasil.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{p.nama}</td>
                      <td className="px-4 py-3">{p.email}</td>
                      <td className="px-4 py-3">{p.telepon}</td>
                      <td className="px-4 py-3">{formatTanggal(p.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDetail(p)} className="text-sky-600 font-semibold hover:underline">Lihat Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-sky-600 mb-4">← Kembali ke daftar</button>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border p-6 h-fit space-y-2">
              <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-600 font-bold text-xl flex items-center justify-center">
                {selected.nama.charAt(0)}
              </div>
              <p className="font-bold text-lg">{selected.nama}</p>
              <p className="text-sm text-gray-500">{selected.email}</p>
              <p className="text-sm text-gray-500">{selected.telepon}</p>
              <p className="text-sm text-gray-500">{selected.alamat}</p>
              <p className="text-xs text-gray-400 pt-2">Terdaftar sejak {formatTanggal(selected.createdAt)}</p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl border overflow-hidden">
              <p className="px-5 py-4 font-bold border-b">Riwayat Pesanan ({riwayat.length})</p>
              <div className="divide-y">
                {riwayat.map((p) => (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.nomorFaktur} <span className="text-sm font-normal text-gray-400">{formatTanggal(p.createdAt)}</span></p>
                      <p className="text-sm text-gray-500">{p.items.map((i) => `${i.layananNama} x${i.jumlah}`).join(', ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sky-600">{rupiah(p.total)}</p>
                      <div className="flex gap-1 justify-end mt-1">
                        <BadgePesanan status={p.status} />
                        <BadgeBayar status={p.pembayaran?.status ?? 'belum_bayar'} />
                      </div>
                    </div>
                  </div>
                ))}
                {riwayat.length === 0 && <p className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada pesanan</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
