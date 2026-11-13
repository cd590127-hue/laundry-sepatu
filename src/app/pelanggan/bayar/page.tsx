'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { BadgePesanan, BadgeBayar } from '@/components/Badges';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB, rupiah, formatTanggal, Pesanan, JenisPembayaran } from '@/lib/store';
import { cetakHalaman } from '@/lib/export';

const menus = [
  { href: '/pelanggan/profil', label: 'Data Pelanggan' },
  { href: '/pelanggan/pesan', label: 'Pesan Laundry' },
  { href: '/pelanggan/bayar', label: 'Pembayaran' },
];

function BayarContent() {
  const { user, ready } = useAuth('pelanggan');
  const params = useSearchParams();
  const selectedId = params.get('id');
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [jenisPembayaran, setJenisPembayaran] = useState<JenisPembayaran[]>([]);
  const [selected, setSelected] = useState<Pesanan | null>(null);
  const [metodeId, setMetodeId] = useState('');
  const [bukti, setBukti] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'tagihan' | 'riwayat'>('tagihan');

  const reload = () => {
    if (!user) return;
    const db = getDB();
    setPesananList(db.pesanan.filter((p) => p.pelangganId === user.id));
    setJenisPembayaran(db.jenisPembayaran);
    if (selectedId) {
      const p = db.pesanan.find((x) => x.id === selectedId);
      if (p) setSelected(p);
    }
  };

  useEffect(reload, [user, selectedId]);

  if (!ready || !user) return null;

  const tagihan = pesananList.filter((p) => p.status !== 'dibatalkan' && (!p.pembayaran || ['belum_bayar', 'ditolak'].includes(p.pembayaran.status) || p.pembayaran.status === 'menunggu_verifikasi'));
  const riwayat = pesananList.filter((p) => p.pembayaran?.status === 'lunas' || p.status === 'dibatalkan');

  const metodeDipilih = jenisPembayaran.find((j) => j.id === metodeId);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('Ukuran file maksimal 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBukti(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBayar = () => {
    if (!selected || !metodeDipilih) {
      setError('Pilih jenis pembayaran terlebih dahulu');
      return;
    }
    if (metodeDipilih.tipe === 'transfer' && !bukti) {
      setError('Unggah bukti transfer terlebih dahulu');
      return;
    }
    setError('');
    const db = getDB();
    const p = db.pesanan.find((x) => x.id === selected.id);
    if (p) {
      p.pembayaran = {
        metodeId: metodeDipilih.id,
        metodeNama: metodeDipilih.nama,
        tipe: metodeDipilih.tipe,
        bukti,
        status: 'menunggu_verifikasi',
        alasanTolak: null,
        tanggalBayar: new Date().toISOString(),
      };
      saveDB(db);
    }
    reload();
    setSelected(db.pesanan.find((x) => x.id === selected.id)!);
    setBukti(null);
    setMetodeId('');
  };

  const statusPembayaran = selected?.pembayaran?.status ?? 'belum_bayar';

  return (
    <DashboardLayout user={user} menus={menus} title="Pembayaran">
      <h2 className="text-2xl font-bold mb-6 print:hidden">Pembayaran</h2>

      {!selected ? (
        <>
          <div className="flex gap-2 mb-4 print:hidden">
            <button onClick={() => setTab('tagihan')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'tagihan' ? 'bg-sky-600 text-white' : 'bg-white border text-gray-600'}`}>Tagihan ({tagihan.length})</button>
            <button onClick={() => setTab('riwayat')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'riwayat' ? 'bg-sky-600 text-white' : 'bg-white border text-gray-600'}`}>Riwayat ({riwayat.length})</button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">No. Faktur</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status Pesanan</th>
                  <th className="px-4 py-3">Pembayaran</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(tab === 'tagihan' ? tagihan : riwayat).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{p.nomorFaktur}</td>
                    <td className="px-4 py-3">{formatTanggal(p.createdAt)}</td>
                    <td className="px-4 py-3">{rupiah(p.total)}</td>
                    <td className="px-4 py-3"><BadgePesanan status={p.status} /></td>
                    <td className="px-4 py-3"><BadgeBayar status={p.pembayaran?.status ?? 'belum_bayar'} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(p)} className="text-sky-600 font-semibold hover:underline">
                        {p.pembayaran?.status === 'lunas' ? 'Lihat Kwitansi' : 'Bayar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {(tab === 'tagihan' ? tagihan : riwayat).length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="max-w-2xl">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-sky-600 mb-4 print:hidden">← Kembali ke daftar</button>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">No. Faktur</p>
                <p className="font-bold text-lg">{selected.nomorFaktur}</p>
              </div>
              <div className="text-right">
                <BadgePesanan status={selected.status} />
                <div className="mt-1"><BadgeBayar status={statusPembayaran} /></div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {selected.items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{it.layananNama} × {it.jumlah}</p>
                    <p className="text-gray-500">{it.bahan} — {it.model}{it.addons.length > 0 && ` • ${it.addons.map((a) => a.nama).join(', ')}`}</p>
                  </div>
                  <p className="font-semibold">{rupiah(it.subtotal)}</p>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-sky-600">{rupiah(selected.total)}</span>
              </div>
            </div>

            {/* Status: menunggu verifikasi */}
            {statusPembayaran === 'menunggu_verifikasi' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                Pembayaran via <b>{selected.pembayaran!.metodeNama}</b> sedang menunggu verifikasi admin.
                {selected.pembayaran!.bukti && (
                  <div className="mt-2">
                    <p className="font-medium">Bukti transfer:</p>
                    <img src={selected.pembayaran!.bukti} alt="Bukti transfer" className="mt-1 max-h-48 rounded-lg border" />
                  </div>
                )}
              </div>
            )}

            {/* Status: ditolak */}
            {statusPembayaran === 'ditolak' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                Pembayaran ditolak{selected.pembayaran!.alasanTolak ? `: ${selected.pembayaran!.alasanTolak}` : ''}. Silakan lakukan pembayaran ulang.
              </div>
            )}

            {/* Form bayar */}
            {(statusPembayaran === 'belum_bayar' || statusPembayaran === 'ditolak') && selected.status !== 'dibatalkan' && (
              <div className="border-t pt-4 space-y-4 print:hidden">
                <h3 className="font-bold">Pilih Jenis Pembayaran</h3>
                <div className="space-y-2">
                  {jenisPembayaran.map((j) => (
                    <label key={j.id} className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer ${metodeId === j.id ? 'border-sky-500 bg-sky-50' : 'hover:border-sky-300'}`}>
                      <input type="radio" name="metode" checked={metodeId === j.id} onChange={() => setMetodeId(j.id)} className="mt-1" />
                      <div>
                        <p className="font-semibold">{j.nama} <span className="text-xs font-normal text-gray-400">({j.tipe})</span></p>
                        <p className="text-sm text-gray-500">{j.keterangan}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {metodeDipilih?.tipe === 'transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unggah Bukti Transfer</label>
                    <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
                    {bukti && <img src={bukti} alt="Preview bukti" className="mt-2 max-h-48 rounded-lg border" />}
                  </div>
                )}

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

                <button onClick={handleBayar} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl">
                  Bayar {rupiah(selected.total)}
                </button>
              </div>
            )}

            {/* Kwitansi */}
            {statusPembayaran === 'lunas' && selected.pembayaran && (
              <div className="border-t pt-4 space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-bold text-green-700">KWITANSI — LUNAS</p>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>Diterima dari: <b>{selected.pelangganNama}</b></p>
                    <p>Sejumlah: <b>{rupiah(selected.total)}</b></p>
                    <p>Metode: <b>{selected.pembayaran.metodeNama}</b></p>
                    <p>Tanggal bayar: <b>{selected.pembayaran.tanggalBayar ? formatTanggal(selected.pembayaran.tanggalBayar) : '-'}</b></p>
                    <p>Untuk pembayaran: Laundry Sepatu ({selected.items.map((i) => i.layananNama).join(', ')})</p>
                  </div>
                </div>
                <button onClick={cetakHalaman} className="print:hidden w-full border border-sky-600 text-sky-600 font-semibold py-2.5 rounded-xl hover:bg-sky-50">
                  🖨️ Cetak Kwitansi
                </button>
              </div>
            )}

            {selected.status === 'dibatalkan' && (
              <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-500">Pesanan ini telah dibatalkan.</div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function BayarPage() {
  return (
    <Suspense>
      <BayarContent />
    </Suspense>
  );
}
