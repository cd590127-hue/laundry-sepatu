'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB, uid, rupiah, Layanan, BahanModel, JenisPembayaran } from '@/lib/store';

const menus = [
  { href: '/admin/transaksi', label: 'Daftar Transaksi' },
  { href: '/admin/master', label: 'Kelola Data Master' },
  { href: '/admin/laporan', label: 'Kelola Laporan' },
];

type Tab = 'layanan' | 'bahan' | 'pembayaran';

export default function MasterPage() {
  const { user, ready } = useAuth('admin');
  const [tab, setTab] = useState<Tab>('layanan');
  const [notif, setNotif] = useState('');

  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [bahanModel, setBahanModel] = useState<BahanModel[]>([]);
  const [jenisPembayaran, setJenisPembayaran] = useState<JenisPembayaran[]>([]);

  // form states
  const [formLayanan, setFormLayanan] = useState({ id: '', nama: '', deskripsi: '', harga: '', kategori: 'utama' as Layanan['kategori'] });
  const [formBahan, setFormBahan] = useState({ id: '', bahan: '', model: '' });
  const [formBayar, setFormBayar] = useState({ id: '', nama: '', tipe: 'transfer' as JenisPembayaran['tipe'], keterangan: '' });
  const [error, setError] = useState('');

  const reload = () => {
    const db = getDB();
    setLayanan(db.layanan);
    setBahanModel(db.bahanModel);
    setJenisPembayaran(db.jenisPembayaran);
  };

  useEffect(reload, []);

  if (!ready || !user) return null;

  const notify = (teks: string) => {
    setNotif(teks);
    setTimeout(() => setNotif(''), 4000);
  };

  // ---------- LAYANAN ----------
  const simpanLayanan = (e: React.FormEvent) => {
    e.preventDefault();
    const harga = parseInt(formLayanan.harga);
    if (!formLayanan.nama.trim() || isNaN(harga) || harga <= 0) {
      setError('Nama dan harga layanan wajib diisi dengan benar');
      return;
    }
    const db = getDB();
    const duplikat = db.layanan.some((l) => l.nama.toLowerCase() === formLayanan.nama.toLowerCase() && l.id !== formLayanan.id);
    if (duplikat) {
      setError('Data sudah ada: layanan dengan nama tersebut sudah terdaftar');
      return;
    }
    setError('');
    if (formLayanan.id) {
      const idx = db.layanan.findIndex((l) => l.id === formLayanan.id);
      db.layanan[idx] = { ...db.layanan[idx], nama: formLayanan.nama, deskripsi: formLayanan.deskripsi, harga, kategori: formLayanan.kategori };
    } else {
      db.layanan.push({ id: uid('l'), nama: formLayanan.nama, deskripsi: formLayanan.deskripsi, harga, kategori: formLayanan.kategori });
    }
    saveDB(db);
    setFormLayanan({ id: '', nama: '', deskripsi: '', harga: '', kategori: 'utama' });
    notify('Data master disimpan. Notifikasi terkirim.');
    reload();
  };

  const hapusLayanan = (id: string) => {
    const db = getDB();
    if (db.pesanan.some((p) => p.items.some((it) => it.layananId === id || it.addons.some((a) => a.id === id)) && ['diterima', 'diproses'].includes(p.status))) {
      setError('Data tidak dapat dihapus: layanan sedang digunakan pesanan aktif');
      return;
    }
    setError('');
    db.layanan = db.layanan.filter((l) => l.id !== id);
    saveDB(db);
    notify('Data layanan dihapus.');
    reload();
  };

  // ---------- BAHAN/MODEL ----------
  const simpanBahan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBahan.bahan.trim() || !formBahan.model.trim()) {
      setError('Bahan dan model wajib diisi');
      return;
    }
    const db = getDB();
    const duplikat = db.bahanModel.some((b) => b.bahan.toLowerCase() === formBahan.bahan.toLowerCase() && b.model.toLowerCase() === formBahan.model.toLowerCase() && b.id !== formBahan.id);
    if (duplikat) {
      setError('Data sudah ada: kombinasi bahan & model tersebut sudah terdaftar');
      return;
    }
    setError('');
    if (formBahan.id) {
      const idx = db.bahanModel.findIndex((b) => b.id === formBahan.id);
      db.bahanModel[idx] = { id: formBahan.id, bahan: formBahan.bahan, model: formBahan.model };
    } else {
      db.bahanModel.push({ id: uid('bm'), bahan: formBahan.bahan, model: formBahan.model });
    }
    saveDB(db);
    setFormBahan({ id: '', bahan: '', model: '' });
    notify('Data master disimpan. Notifikasi terkirim.');
    reload();
  };

  const hapusBahan = (id: string) => {
    const db = getDB();
    if (db.pesanan.some((p) => p.items.some((it) => it.bahanModelId === id) && ['diterima', 'diproses'].includes(p.status))) {
      setError('Data tidak dapat dihapus: sedang digunakan pesanan aktif');
      return;
    }
    setError('');
    db.bahanModel = db.bahanModel.filter((b) => b.id !== id);
    saveDB(db);
    notify('Data bahan/model dihapus.');
    reload();
  };

  // ---------- JENIS PEMBAYARAN ----------
  const simpanBayar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBayar.nama.trim()) {
      setError('Nama jenis pembayaran wajib diisi');
      return;
    }
    const db = getDB();
    const duplikat = db.jenisPembayaran.some((j) => j.nama.toLowerCase() === formBayar.nama.toLowerCase() && j.id !== formBayar.id);
    if (duplikat) {
      setError('Data sudah ada: jenis pembayaran tersebut sudah terdaftar');
      return;
    }
    setError('');
    if (formBayar.id) {
      const idx = db.jenisPembayaran.findIndex((j) => j.id === formBayar.id);
      db.jenisPembayaran[idx] = { id: formBayar.id, nama: formBayar.nama, tipe: formBayar.tipe, keterangan: formBayar.keterangan };
    } else {
      db.jenisPembayaran.push({ id: uid('jp'), nama: formBayar.nama, tipe: formBayar.tipe, keterangan: formBayar.keterangan });
    }
    saveDB(db);
    setFormBayar({ id: '', nama: '', tipe: 'transfer', keterangan: '' });
    notify('Data master disimpan. Notifikasi terkirim.');
    reload();
  };

  const hapusBayar = (id: string) => {
    const db = getDB();
    if (db.pesanan.some((p) => p.pembayaran?.metodeId === id && ['diterima', 'diproses'].includes(p.status))) {
      setError('Data tidak dapat dihapus: sedang digunakan pesanan aktif');
      return;
    }
    setError('');
    db.jenisPembayaran = db.jenisPembayaran.filter((j) => j.id !== id);
    saveDB(db);
    notify('Data jenis pembayaran dihapus.');
    reload();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'layanan', label: 'Layanan' },
    { key: 'bahan', label: 'Bahan & Model Sepatu' },
    { key: 'pembayaran', label: 'Jenis Pembayaran' },
  ];

  const inputCls = 'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500';

  return (
    <DashboardLayout user={user} menus={menus} title="Kelola Data Master">
      <h2 className="text-2xl font-bold mb-6">Kelola Data Master</h2>

      {notif && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">🔔 {notif}</div>}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setError(''); }} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === t.key ? 'bg-sky-600 text-white' : 'bg-white border text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'layanan' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={simpanLayanan} className="bg-white rounded-xl border p-6 space-y-3 h-fit">
            <h3 className="font-bold">{formLayanan.id ? 'Ubah Layanan' : 'Tambah Layanan'}</h3>
            <input placeholder="Nama layanan" value={formLayanan.nama} onChange={(e) => setFormLayanan({ ...formLayanan, nama: e.target.value })} className={inputCls} />
            <input placeholder="Deskripsi (materials, type, dll)" value={formLayanan.deskripsi} onChange={(e) => setFormLayanan({ ...formLayanan, deskripsi: e.target.value })} className={inputCls} />
            <input placeholder="Harga (Rp)" type="number" min={0} value={formLayanan.harga} onChange={(e) => setFormLayanan({ ...formLayanan, harga: e.target.value })} className={inputCls} />
            <select value={formLayanan.kategori} onChange={(e) => setFormLayanan({ ...formLayanan, kategori: e.target.value as Layanan['kategori'] })} className={inputCls}>
              <option value="utama">Layanan Utama</option>
              <option value="addon">Add-on</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-lg">{formLayanan.id ? 'Simpan Perubahan' : 'Tambah'}</button>
              {formLayanan.id && <button type="button" onClick={() => setFormLayanan({ id: '', nama: '', deskripsi: '', harga: '', kategori: 'utama' })} className="text-gray-600 px-4">Batal</button>}
            </div>
          </form>
          <div className="bg-white rounded-xl border divide-y">
            {layanan.map((l) => (
              <div key={l.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{l.nama} <span className="text-xs font-normal text-gray-400">({l.kategori === 'utama' ? 'Utama' : 'Add-on'})</span></p>
                  <p className="text-sm text-gray-500">{l.deskripsi}</p>
                  <p className="text-sm font-bold text-sky-600">{rupiah(l.harga)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setFormLayanan({ id: l.id, nama: l.nama, deskripsi: l.deskripsi, harga: String(l.harga), kategori: l.kategori })} className="text-sm text-blue-600 hover:underline">Ubah</button>
                  <button onClick={() => hapusLayanan(l.id)} className="text-sm text-red-600 hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bahan' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={simpanBahan} className="bg-white rounded-xl border p-6 space-y-3 h-fit">
            <h3 className="font-bold">{formBahan.id ? 'Ubah Bahan & Model' : 'Tambah Bahan & Model'}</h3>
            <input placeholder="Bahan (cth: Canvas)" value={formBahan.bahan} onChange={(e) => setFormBahan({ ...formBahan, bahan: e.target.value })} className={inputCls} />
            <input placeholder="Model (cth: Sneakers)" value={formBahan.model} onChange={(e) => setFormBahan({ ...formBahan, model: e.target.value })} className={inputCls} />
            <div className="flex gap-2">
              <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-lg">{formBahan.id ? 'Simpan Perubahan' : 'Tambah'}</button>
              {formBahan.id && <button type="button" onClick={() => setFormBahan({ id: '', bahan: '', model: '' })} className="text-gray-600 px-4">Batal</button>}
            </div>
          </form>
          <div className="bg-white rounded-xl border divide-y">
            {bahanModel.map((b) => (
              <div key={b.id} className="px-5 py-4 flex items-center justify-between">
                <p><span className="font-semibold">{b.bahan}</span> <span className="text-gray-500">— {b.model}</span></p>
                <div className="flex gap-2">
                  <button onClick={() => setFormBahan({ id: b.id, bahan: b.bahan, model: b.model })} className="text-sm text-blue-600 hover:underline">Ubah</button>
                  <button onClick={() => hapusBahan(b.id)} className="text-sm text-red-600 hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pembayaran' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={simpanBayar} className="bg-white rounded-xl border p-6 space-y-3 h-fit">
            <h3 className="font-bold">{formBayar.id ? 'Ubah Jenis Pembayaran' : 'Tambah Jenis Pembayaran'}</h3>
            <input placeholder="Nama (cth: Transfer BCA)" value={formBayar.nama} onChange={(e) => setFormBayar({ ...formBayar, nama: e.target.value })} className={inputCls} />
            <select value={formBayar.tipe} onChange={(e) => setFormBayar({ ...formBayar, tipe: e.target.value as JenisPembayaran['tipe'] })} className={inputCls}>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
            </select>
            <input placeholder="Keterangan (cth: no. rekening)" value={formBayar.keterangan} onChange={(e) => setFormBayar({ ...formBayar, keterangan: e.target.value })} className={inputCls} />
            <div className="flex gap-2">
              <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-lg">{formBayar.id ? 'Simpan Perubahan' : 'Tambah'}</button>
              {formBayar.id && <button type="button" onClick={() => setFormBayar({ id: '', nama: '', tipe: 'transfer', keterangan: '' })} className="text-gray-600 px-4">Batal</button>}
            </div>
          </form>
          <div className="bg-white rounded-xl border divide-y">
            {jenisPembayaran.map((j) => (
              <div key={j.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{j.nama} <span className="text-xs font-normal text-gray-400">({j.tipe})</span></p>
                  <p className="text-sm text-gray-500">{j.keterangan}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setFormBayar({ id: j.id, nama: j.nama, tipe: j.tipe, keterangan: j.keterangan })} className="text-sm text-blue-600 hover:underline">Ubah</button>
                  <button onClick={() => hapusBayar(j.id)} className="text-sm text-red-600 hover:underline">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
