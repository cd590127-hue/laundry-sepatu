'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BadgePesanan, BadgeBayar } from '@/components/Badges';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB, rupiah, formatTanggal, Pesanan, StatusPesanan } from '@/lib/store';

const menus = [
  { href: '/admin/transaksi', label: 'Daftar Transaksi' },
  { href: '/admin/master', label: 'Kelola Data Master' },
  { href: '/admin/laporan', label: 'Kelola Laporan' },
];

const alurStatus: StatusPesanan[] = ['diterima', 'diproses', 'selesai', 'diambil'];

export default function TransaksiPage() {
  const { user, ready } = useAuth('admin');
  const [list, setList] = useState<Pesanan[]>([]);
  const [selected, setSelected] = useState<Pesanan | null>(null);
  const [filter, setFilter] = useState<'semua' | StatusPesanan>('semua');
  const [alasanTolak, setAlasanTolak] = useState('');
  const [showTolak, setShowTolak] = useState(false);
  const [showBatal, setShowBatal] = useState(false);
  const [notif, setNotif] = useState('');

  const reload = () => {
    const db = getDB();
    const sorted = [...db.pesanan].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setList(sorted);
    if (selected) setSelected(db.pesanan.find((p) => p.id === selected.id) ?? null);
  };

  useEffect(reload, []);

  if (!ready || !user) return null;

  const filtered = filter === 'semua' ? list : list.filter((p) => p.status === filter);

  const updateStatus = (status: StatusPesanan) => {
    if (!selected) return;
    const db = getDB();
    const p = db.pesanan.find((x) => x.id === selected.id)!;
    p.status = status;
    saveDB(db);
    setNotif(`Status pesanan ${p.nomorFaktur} diubah menjadi "${status}". Notifikasi terkirim ke pelanggan.`);
    reload();
  };

  const verifikasiBayar = () => {
    if (!selected?.pembayaran) return;
    const db = getDB();
    const p = db.pesanan.find((x) => x.id === selected.id)!;
    p.pembayaran!.status = 'lunas';
    saveDB(db);
    setNotif(`Pembayaran ${p.nomorFaktur} diverifikasi (LUNAS). Notifikasi terkirim ke pelanggan.`);
    reload();
  };

  const tolakBayar = () => {
    if (!selected?.pembayaran || !alasanTolak.trim()) return;
    const db = getDB();
    const p = db.pesanan.find((x) => x.id === selected.id)!;
    p.pembayaran!.status = 'ditolak';
    p.pembayaran!.alasanTolak = alasanTolak;
    saveDB(db);
    setNotif(`Pembayaran ${p.nomorFaktur} ditolak. Notifikasi terkirim ke pelanggan.`);
    setShowTolak(false);
    setAlasanTolak('');
    reload();
  };

  const batalkanPesanan = () => {
    updateStatus('dibatalkan');
    setShowBatal(false);
  };

  const nextStatus = selected && selected.status !== 'dibatalkan' ? alurStatus[alurStatus.indexOf(selected.status) + 1] : null;

  return (
    <DashboardLayout user={user} menus={menus} title="Daftar Transaksi">
      <h2 className="text-2xl font-bold mb-6">Daftar Transaksi</h2>

      {notif && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex justify-between">
          <span>🔔 {notif}</span>
          <button onClick={() => setNotif('')} className="font-bold">×</button>
        </div>
      )}

      {!selected ? (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {(['semua', ...alurStatus, 'dibatalkan'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${filter === f ? 'bg-sky-600 text-white' : 'bg-white border text-gray-600'}`}>
                {f === 'semua' ? 'Semua' : f}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Faktur</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pembayaran</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{p.nomorFaktur}</td>
                    <td className="px-4 py-3">{p.pelangganNama}</td>
                    <td className="px-4 py-3">{formatTanggal(p.createdAt)}</td>
                    <td className="px-4 py-3">{rupiah(p.total)}</td>
                    <td className="px-4 py-3"><BadgePesanan status={p.status} /></td>
                    <td className="px-4 py-3"><BadgeBayar status={p.pembayaran?.status ?? 'belum_bayar'} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(p)} className="text-sky-600 font-semibold hover:underline">Kelola</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Tidak ada transaksi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="max-w-2xl">
          <button onClick={() => { setSelected(null); setNotif(''); }} className="text-sm text-gray-500 hover:text-sky-600 mb-4">← Kembali ke daftar</button>
          <div className="bg-white rounded-xl border p-6 space-y-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">No. Faktur</p>
                <p className="font-bold text-lg">{selected.nomorFaktur}</p>
                <p className="text-sm text-gray-500 mt-1">{selected.pelangganNama} • {selected.pelangganTelepon}</p>
              </div>
              <div className="text-right space-y-1">
                <BadgePesanan status={selected.status} />
                <div><BadgeBayar status={selected.pembayaran?.status ?? 'belum_bayar'} /></div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {selected.items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{it.layananNama} × {it.jumlah}</p>
                    <p className="text-gray-500">{it.bahan} — {it.model}{it.addons.length > 0 && ` • ${it.addons.map((a) => a.nama).join(', ')}`}</p>
                    {it.catatan && <p className="text-gray-400 italic">Catatan: {it.catatan}</p>}
                  </div>
                  <p className="font-semibold">{rupiah(it.subtotal)}</p>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-sky-600">{rupiah(selected.total)}</span>
              </div>
            </div>

            {/* Verifikasi pembayaran */}
            {selected.pembayaran?.status === 'menunggu_verifikasi' && (
              <div className="border rounded-xl p-4 bg-yellow-50 space-y-3">
                <p className="font-bold text-yellow-800">Verifikasi Pembayaran</p>
                <p className="text-sm text-gray-600">Metode: <b>{selected.pembayaran.metodeNama}</b> ({selected.pembayaran.tipe})</p>
                {selected.pembayaran.bukti ? (
                  <img src={selected.pembayaran.bukti} alt="Bukti transfer" className="max-h-56 rounded-lg border" />
                ) : (
                  <p className="text-sm text-gray-400 italic">Tanpa bukti (tunai)</p>
                )}
                <div className="flex gap-2">
                  <button onClick={verifikasiBayar} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">✓ Verifikasi Lunas</button>
                  <button onClick={() => setShowTolak(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">✗ Tolak</button>
                </div>
                {showTolak && (
                  <div className="space-y-2">
                    <input value={alasanTolak} onChange={(e) => setAlasanTolak(e.target.value)} placeholder="Alasan penolakan" className="w-full border rounded-lg px-3 py-2 text-sm" />
                    <button onClick={tolakBayar} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">Kirim Penolakan</button>
                  </div>
                )}
              </div>
            )}

            {/* Ubah status */}
            {selected.status !== 'dibatalkan' && (
              <div className="border-t pt-4 space-y-3">
                <p className="font-bold">Ubah Status Pesanan</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {alurStatus.map((s, i) => {
                    const currentIdx = alurStatus.indexOf(selected.status as StatusPesanan);
                    const isCurrent = s === selected.status;
                    const isDone = i < currentIdx;
                    return (
                      <span key={s} className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${isCurrent ? 'bg-sky-600 text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {s}
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  {nextStatus && (
                    <button onClick={() => updateStatus(nextStatus)} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg text-sm capitalize">
                      Lanjut ke: {nextStatus} →
                    </button>
                  )}
                  {selected.pembayaran?.status !== 'lunas' && selected.status === 'diterima' && (
                    <button onClick={() => setShowBatal(true)} className="border border-red-300 text-red-600 font-semibold px-4 py-2 rounded-lg text-sm">Batalkan Pesanan</button>
                  )}
                </div>
                {showBatal && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-red-700">Yakin batalkan pesanan ini?</p>
                    <div className="flex gap-2">
                      <button onClick={batalkanPesanan} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">Ya, Batalkan</button>
                      <button onClick={() => setShowBatal(false)} className="text-sm text-gray-600 px-4 py-2">Tidak</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
