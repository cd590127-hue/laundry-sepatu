'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/useAuth';
import { getDB, saveDB, uid, nextNomorFaktur, rupiah, Layanan, BahanModel, ItemPesanan } from '@/lib/store';

const menus = [
  { href: '/pelanggan/profil', label: 'Data Pelanggan' },
  { href: '/pelanggan/pesan', label: 'Pesan Laundry' },
  { href: '/pelanggan/bayar', label: 'Pembayaran' },
];

interface DraftItem {
  layananId: string;
  bahanModelId: string;
  jumlah: number;
  catatan: string;
  addonIds: string[];
}

export default function PesanPage() {
  const { user, ready } = useAuth('pelanggan');
  const router = useRouter();
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [bahanModel, setBahanModel] = useState<BahanModel[]>([]);
  const [items, setItems] = useState<DraftItem[]>([{ layananId: '', bahanModelId: '', jumlah: 1, catatan: '', addonIds: [] }]);
  const [error, setError] = useState('');

  useEffect(() => {
    const db = getDB();
    setLayanan(db.layanan);
    setBahanModel(db.bahanModel);
  }, []);

  if (!ready || !user) return null;

  const utama = layanan.filter((l) => l.kategori === 'utama');
  const addons = layanan.filter((l) => l.kategori === 'addon');

  const updateItem = (i: number, patch: Partial<DraftItem>) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const tambahItem = () => setItems([...items, { layananId: '', bahanModelId: '', jumlah: 1, catatan: '', addonIds: [] }]);
  const hapusItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const hitungSubtotal = (it: DraftItem): number => {
    const l = layanan.find((x) => x.id === it.layananId);
    if (!l) return 0;
    const addonTotal = it.addonIds.reduce((s, id) => s + (layanan.find((x) => x.id === id)?.harga ?? 0), 0);
    return (l.harga + addonTotal) * it.jumlah;
  };

  const total = items.reduce((s, it) => s + hitungSubtotal(it), 0);
  const valid = items.every((it) => it.layananId && it.bahanModelId && it.jumlah >= 1);

  const handleRincian = () => {
    if (!valid) {
      setError('Lengkapi layanan, bahan/model sepatu, dan jumlah untuk setiap sepatu');
      return;
    }
    setError('');
    const db = getDB();
    const finalItems: ItemPesanan[] = items.map((it) => {
      const l = layanan.find((x) => x.id === it.layananId)!;
      const bm = bahanModel.find((x) => x.id === it.bahanModelId)!;
      const addonList = it.addonIds.map((id) => {
        const a = layanan.find((x) => x.id === id)!;
        return { id: a.id, nama: a.nama, harga: a.harga };
      });
      return {
        layananId: l.id,
        layananNama: l.nama,
        harga: l.harga,
        bahanModelId: bm.id,
        bahan: bm.bahan,
        model: bm.model,
        jumlah: it.jumlah,
        catatan: it.catatan,
        addons: addonList,
        subtotal: (l.harga + addonList.reduce((s, a) => s + a.harga, 0)) * it.jumlah,
      };
    });
    const pesanan = {
      id: uid('ps'),
      nomorFaktur: nextNomorFaktur(db),
      pelangganId: user.id,
      pelangganNama: user.nama,
      pelangganTelepon: user.telepon,
      items: finalItems,
      total,
      status: 'diterima' as const,
      pembayaran: null,
      createdAt: new Date().toISOString(),
    };
    db.pesanan.push(pesanan);
    saveDB(db);
    router.push(`/pelanggan/pesan/rincian?id=${pesanan.id}`);
  };

  return (
    <DashboardLayout user={user} menus={menus} title="Pesan Laundry">
      <h2 className="text-2xl font-bold mb-6">Pesan Laundry</h2>

      <div className="space-y-6 max-w-3xl">
        {items.map((it, i) => (
          <div key={i} className="bg-white rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Sepatu #{i + 1}</h3>
              {items.length > 1 && (
                <button onClick={() => hapusItem(i)} className="text-sm text-red-600 hover:underline">Hapus</button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Layanan</label>
                <select value={it.layananId} onChange={(e) => updateItem(i, { layananId: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">-- Pilih layanan --</option>
                  {utama.map((l) => (
                    <option key={l.id} value={l.id}>{l.nama} — {rupiah(l.harga)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Bahan &amp; Model Sepatu</label>
                <select value={it.bahanModelId} onChange={(e) => updateItem(i, { bahanModelId: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">-- Pilih bahan &amp; model --</option>
                  {bahanModel.map((b) => (
                    <option key={b.id} value={b.id}>{b.bahan} — {b.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <input type="number" min={1} value={it.jumlah} onChange={(e) => updateItem(i, { jumlah: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <input value={it.catatan} onChange={(e) => updateItem(i, { catatan: e.target.value })} placeholder="cth: noda lumpur di sol" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add-on (opsional)</label>
              <div className="flex flex-wrap gap-2">
                {addons.map((a) => {
                  const active = it.addonIds.includes(a.id);
                  return (
                    <button key={a.id} type="button" onClick={() => updateItem(i, { addonIds: active ? it.addonIds.filter((x) => x !== a.id) : [...it.addonIds, a.id] })} className={`px-3 py-1.5 rounded-full text-sm border font-medium ${active ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-300 text-gray-600 hover:border-sky-400'}`}>
                      {a.nama} +{rupiah(a.harga)}
                    </button>
                  );
                })}
              </div>
            </div>
            {it.layananId && (
              <p className="text-sm text-gray-500">Subtotal: <span className="font-bold text-sky-600">{rupiah(hitungSubtotal(it))}</span></p>
            )}
          </div>
        ))}

        <button onClick={tambahItem} className="w-full border-2 border-dashed border-sky-300 text-sky-600 font-semibold py-3 rounded-xl hover:bg-sky-50">
          + Tambah Sepatu Lain
        </button>

        <div className="bg-white rounded-xl border p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Keseluruhan</p>
            <p className="text-2xl font-bold text-sky-600">{rupiah(total)}</p>
          </div>
          <button onClick={handleRincian} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl">
            Tampilkan Rincian →
          </button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
