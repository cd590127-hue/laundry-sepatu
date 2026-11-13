'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB, rupiah, formatTanggal, Pesanan } from '@/lib/store';

const menus = [
  { href: '/pelanggan/profil', label: 'Data Pelanggan' },
  { href: '/pelanggan/pesan', label: 'Pesan Laundry' },
  { href: '/pelanggan/bayar', label: 'Pembayaran' },
];

function RincianContent() {
  const { user, ready } = useAuth('pelanggan');
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [checked, setChecked] = useState(false);
  const [konfirmasiBatal, setKonfirmasiBatal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const db = getDB();
    setPesanan(db.pesanan.find((p) => p.id === id) ?? null);
  }, [id]);

  if (!ready || !user) return null;
  if (!pesanan) {
    return (
      <DashboardLayout user={user} menus={menus} title="Rincian Pesanan">
        <p className="text-gray-500">Pesanan tidak ditemukan. <Link href="/pelanggan/pesan" className="text-sky-600">Buat pesanan baru</Link></p>
      </DashboardLayout>
    );
  }

  const handleKonfirmasi = () => {
    router.push(`/pelanggan/bayar?id=${pesanan.id}`);
  };

  const handleBatal = () => {
    const db = getDB();
    const p = db.pesanan.find((x) => x.id === pesanan.id);
    if (p) {
      p.status = 'dibatalkan';
      saveDB(db);
    }
    router.push('/pelanggan');
  };

  return (
    <DashboardLayout user={user} menus={menus} title="Rincian Pesanan">
      <h2 className="text-2xl font-bold mb-6">Rincian Pesanan</h2>

      <div className="max-w-2xl bg-white rounded-xl border p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">No. Faktur</p>
            <p className="font-bold">{pesanan.nomorFaktur}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Tanggal</p>
            <p className="font-semibold">{formatTanggal(pesanan.createdAt)}</p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          {pesanan.items.map((it, i) => (
            <div key={i} className="flex justify-between gap-4">
              <div>
                <p className="font-semibold">{it.layananNama} <span className="text-gray-400 font-normal">× {it.jumlah}</span></p>
                <p className="text-sm text-gray-500">{it.bahan} — {it.model}</p>
                {it.addons.length > 0 && (
                  <p className="text-sm text-gray-500">Add-on: {it.addons.map((a) => a.nama).join(', ')}</p>
                )}
                {it.catatan && <p className="text-sm text-gray-400 italic">Catatan: {it.catatan}</p>}
              </div>
              <p className="font-semibold shrink-0">{rupiah(it.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <p className="font-bold">Total</p>
          <p className="text-xl font-bold text-sky-600">{rupiah(pesanan.total)}</p>
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1" />
          Saya menyatakan rincian pesanan di atas sudah benar dan menyetujui syarat &amp; ketentuan layanan.
        </label>

        <div className="flex gap-3">
          <button onClick={handleKonfirmasi} disabled={!checked} className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl">
            Konfirmasi &amp; Lanjut Pembayaran
          </button>
          <button onClick={() => setKonfirmasiBatal(true)} className="px-6 border border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50">
            Batalkan
          </button>
        </div>

        {konfirmasiBatal && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-700 font-medium">Yakin ingin membatalkan pesanan ini?</p>
            <div className="flex gap-2">
              <button onClick={handleBatal} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">Ya, Batalkan</button>
              <button onClick={() => setKonfirmasiBatal(false)} className="text-sm text-gray-600 px-4 py-2">Kembali</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function RincianPage() {
  return (
    <Suspense>
      <RincianContent />
    </Suspense>
  );
}
