'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB, uid, formatTanggal, Laporan } from '@/lib/store';
import { generateLaporan, jenisLaporanList, JenisLaporan, HasilLaporan } from '@/lib/laporan';
import { exportPDF, exportExcel, cetakHalaman } from '@/lib/export';

const menus = [
  { href: '/admin/transaksi', label: 'Daftar Transaksi' },
  { href: '/admin/master', label: 'Kelola Data Master' },
  { href: '/admin/laporan', label: 'Kelola Laporan' },
];

export default function LaporanPage() {
  const { user, ready } = useAuth('admin');
  const [jenis, setJenis] = useState<JenisLaporan>('pemesanan');
  const [mulai, setMulai] = useState('');
  const [selesai, setSelesai] = useState('');
  const [error, setError] = useState('');
  const [hasil, setHasil] = useState<HasilLaporan | null>(null);
  const [riwayat, setRiwayat] = useState<Laporan[]>([]);
  const [notif, setNotif] = useState('');

  useEffect(() => {
    const db = getDB();
    setRiwayat([...db.laporan].reverse());
  }, []);

  if (!ready || !user) return null;

  const handleTampilkan = () => {
    setError('');
    if (!mulai || !selesai) {
      setError('Periode tidak valid: pilih tanggal mulai dan selesai');
      return;
    }
    if (mulai > selesai) {
      setError('Periode tidak valid: tanggal mulai harus sebelum tanggal selesai');
      return;
    }
    const h = generateLaporan(jenis, mulai, selesai);
    setHasil(h);
  };

  const handleSimpan = () => {
    const db = getDB();
    const jenisNama = jenisLaporanList.find((j) => j.key === jenis)!.label;
    db.laporan.push({
      id: uid('lap'),
      jenis,
      jenisNama,
      periodeMulai: mulai,
      periodeSelesai: selesai,
      dibuatOleh: user.nama,
      createdAt: new Date().toISOString(),
    });
    saveDB(db);
    setRiwayat([...db.laporan].reverse());
    setNotif('Laporan tersimpan. Pemilik dapat melihat laporan ini.');
    setTimeout(() => setNotif(''), 4000);
  };

  const judul = jenisLaporanList.find((j) => j.key === jenis)!.label;
  const periodeLabel = `Periode: ${formatTanggal(mulai)} — ${formatTanggal(selesai)}`;
  const namaFile = `${judul.replace(/\s+/g, '_')}_${mulai}_${selesai}`;

  return (
    <DashboardLayout user={user} menus={menus} title="Kelola Laporan">
      <h2 className="text-2xl font-bold mb-6 print:hidden">Kelola Laporan</h2>

      {notif && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 print:hidden">🔔 {notif}</div>}

      <div className="bg-white rounded-xl border p-6 space-y-4 mb-6 print:hidden">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Jenis Laporan</label>
            <select value={jenis} onChange={(e) => { setJenis(e.target.value as JenisLaporan); setHasil(null); }} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
              {jenisLaporanList.map((j) => (
                <option key={j.key} value={j.key}>{j.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Mulai</label>
            <input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Selesai</label>
            <input type="date" value={selesai} onChange={(e) => setSelesai(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button onClick={handleTampilkan} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2.5 rounded-lg">
          Tampilkan Laporan
        </button>
      </div>

      {hasil && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold">{judul}</h3>
              <p className="text-sm text-gray-500">{periodeLabel} • {hasil.ringkasan}</p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button onClick={handleSimpan} className="border border-green-600 text-green-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-50">💾 Simpan Laporan</button>
              <button onClick={() => exportPDF(judul, periodeLabel, hasil.kolom, hasil.rows, `${namaFile}.pdf`)} className="border border-red-500 text-red-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-50">📄 PDF</button>
              <button onClick={() => exportExcel(hasil.kolom, hasil.rows, `${namaFile}.xlsx`)} className="border border-green-600 text-green-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-50">📊 Excel</button>
              <button onClick={cetakHalaman} className="border border-gray-500 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-50">🖨️ Cetak</button>
            </div>
          </div>
          {hasil.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sky-50 text-left">
                  <tr>
                    {hasil.kolom.map((k) => (
                      <th key={k.key} className="px-3 py-2 font-semibold">{k.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hasil.rows.map((r, i) => (
                    <tr key={i}>
                      {hasil.kolom.map((k) => (
                        <td key={k.key} className="px-3 py-2">{r[k.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Tidak ada data pada periode ini</p>
          )}
        </div>
      )}

      <div className="print:hidden">
        <h3 className="font-bold mb-3">Laporan Tersimpan (dapat dilihat pemilik)</h3>
        <div className="bg-white rounded-xl border divide-y">
          {riwayat.length === 0 && <p className="px-5 py-6 text-center text-gray-400 text-sm">Belum ada laporan tersimpan</p>}
          {riwayat.map((l) => (
            <div key={l.id} className="px-5 py-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{l.jenisNama}</p>
                <p className="text-sm text-gray-500">Periode {formatTanggal(l.periodeMulai)} — {formatTanggal(l.periodeSelesai)} • dibuat {l.dibuatOleh} pada {formatTanggal(l.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
