// Data layer: localStorage-based store untuk simulasi penuh di browser

export interface User {
  id: string;
  nama: string;
  email: string;
  password: string;
  telepon: string;
  alamat: string;
  role: 'pelanggan' | 'admin' | 'pemilik';
  createdAt: string;
}

export interface Layanan {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  kategori: 'utama' | 'addon';
}

export interface BahanModel {
  id: string;
  bahan: string;
  model: string;
}

export interface JenisPembayaran {
  id: string;
  nama: string;
  tipe: 'tunai' | 'transfer';
  keterangan: string; // info rekening dll
}

export interface ItemPesanan {
  layananId: string;
  layananNama: string;
  harga: number;
  bahanModelId: string;
  bahan: string;
  model: string;
  jumlah: number;
  catatan: string;
  addons: { id: string; nama: string; harga: number }[];
  subtotal: number;
}

export type StatusPesanan = 'diterima' | 'diproses' | 'selesai' | 'diambil' | 'dibatalkan';
export type StatusPembayaran = 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'ditolak';

export interface Pembayaran {
  metodeId: string;
  metodeNama: string;
  tipe: 'tunai' | 'transfer';
  bukti: string | null; // base64
  status: StatusPembayaran;
  alasanTolak: string | null;
  tanggalBayar: string | null;
}

export interface Pesanan {
  id: string;
  nomorFaktur: string;
  pelangganId: string;
  pelangganNama: string;
  pelangganTelepon: string;
  items: ItemPesanan[];
  total: number;
  status: StatusPesanan;
  pembayaran: Pembayaran | null;
  createdAt: string;
}

export interface Ulasan {
  id: string;
  nama: string;
  rating: number;
  teks: string;
  tanggal: string;
}

export interface Laporan {
  id: string;
  jenis: 'pemesanan' | 'keuangan' | 'pelanggan';
  jenisNama: string;
  periodeMulai: string;
  periodeSelesai: string;
  dibuatOleh: string;
  createdAt: string;
}

const DB_KEY = 'laundry_sepatu_db_v1';

interface DB {
  users: User[];
  layanan: Layanan[];
  bahanModel: BahanModel[];
  jenisPembayaran: JenisPembayaran[];
  pesanan: Pesanan[];
  ulasan: Ulasan[];
  laporan: Laporan[];
  session: { userId: string } | null;
}

function seed(): DB {
  const now = new Date().toISOString();
  const users: User[] = [
    { id: 'u-admin', nama: 'Admin Laundry', email: 'admin@laundry.id', password: 'admin123', telepon: '081266100500', alamat: 'Jl. Ceger Raya No.42, Tangerang Selatan', role: 'admin', createdAt: now },
    { id: 'u-pemilik', nama: 'Pemilik Usaha', email: 'pemilik@laundry.id', password: 'pemilik123', telepon: '081266100501', alamat: 'Jl. Ceger Raya No.42, Tangerang Selatan', role: 'pemilik', createdAt: now },
    { id: 'u-p1', nama: 'Fredi Saputro', email: 'fredi@mail.com', password: 'fredi123', telepon: '081234567801', alamat: 'Jl. Merpati No.10, Jakarta Selatan', role: 'pelanggan', createdAt: daysAgo(30) },
    { id: 'u-p2', nama: 'Andhakir', email: 'andhakir@mail.com', password: 'andhakir123', telepon: '081234567802', alamat: 'Jl. Kenanga No.5, Depok', role: 'pelanggan', createdAt: daysAgo(25) },
    { id: 'u-p3', nama: 'R. Taufiq NM', email: 'taufiq@mail.com', password: 'taufiq123', telepon: '081234567803', alamat: 'Jl. Anggrek No.3, Tangerang', role: 'pelanggan', createdAt: daysAgo(20) },
  ];

  const layanan: Layanan[] = [
    { id: 'l-std', nama: 'Standart', deskripsi: 'Materials: Canvas, Nylon, Rubber, etc', harga: 70000, kategori: 'utama' },
    { id: 'l-prem', nama: 'Premium', deskripsi: 'Materials: Suede, Nubuck, Leather, Mesh, etc', harga: 100000, kategori: 'utama' },
    { id: 'l-leather', nama: 'Leather Deep Cleaning', deskripsi: 'Type: Boots, Bespoke Shoes, etc', harga: 150000, kategori: 'utama' },
    { id: 'l-bright', nama: 'Brightning +', deskripsi: 'Sangat bagus untuk canvas dan mesh', harga: 30000, kategori: 'addon' },
    { id: 'l-repel', nama: 'Water Repellent', deskripsi: 'Waterproof / Anti Air', harga: 50000, kategori: 'addon' },
    { id: 'l-unyel', nama: 'Unyellowing Midsole', deskripsi: 'Oksidasi dan Pemutihan UV pada midsole', harga: 80000, kategori: 'addon' },
  ];

  const bahanModel: BahanModel[] = [
    { id: 'bm-1', bahan: 'Canvas', model: 'Sneakers' },
    { id: 'bm-2', bahan: 'Nylon', model: 'Running' },
    { id: 'bm-3', bahan: 'Rubber', model: 'Slip On' },
    { id: 'bm-4', bahan: 'Suede', model: 'Sneakers' },
    { id: 'bm-5', bahan: 'Nubuck', model: 'Boots' },
    { id: 'bm-6', bahan: 'Leather', model: 'Bespoke Shoes' },
    { id: 'bm-7', bahan: 'Mesh', model: 'Running' },
  ];

  const jenisPembayaran: JenisPembayaran[] = [
    { id: 'jp-tunai', nama: 'Tunai', tipe: 'tunai', keterangan: 'Bayar langsung ke admin di toko' },
    { id: 'jp-bca', nama: 'Transfer BCA', tipe: 'transfer', keterangan: 'BCA 1234567890 a.n. Laundry Sepatu' },
    { id: 'jp-mandiri', nama: 'Transfer Mandiri', tipe: 'transfer', keterangan: 'Mandiri 0987654321 a.n. Laundry Sepatu' },
  ];

  const item = (layananId: string, bmId: string, jumlah: number, addonIds: string[], catatan = ''): ItemPesanan => {
    const l = layanan.find((x) => x.id === layananId)!;
    const bm = bahanModel.find((x) => x.id === bmId)!;
    const addons = addonIds.map((id) => { const a = layanan.find((x) => x.id === id)!; return { id: a.id, nama: a.nama, harga: a.harga }; });
    const subtotal = (l.harga + addons.reduce((s, a) => s + a.harga, 0)) * jumlah;
    return { layananId, layananNama: l.nama, harga: l.harga, bahanModelId: bmId, bahan: bm.bahan, model: bm.model, jumlah, catatan, addons, subtotal };
  };

  const mkPesanan = (id: string, no: string, uid: string, items: ItemPesanan[], status: StatusPesanan, bayar: Pembayaran | null, hariLalu: number): Pesanan => {
    const u = users.find((x) => x.id === uid)!;
    return { id, nomorFaktur: no, pelangganId: uid, pelangganNama: u.nama, pelangganTelepon: u.telepon, items, total: items.reduce((s, i) => s + i.subtotal, 0), status, pembayaran: bayar, createdAt: daysAgo(hariLalu) };
  };

  const pesanan: Pesanan[] = [
    mkPesanan('ps-1', 'INV-0001', 'u-p1', [item('l-std', 'bm-1', 2, ['l-bright'])], 'diambil', { metodeId: 'jp-bca', metodeNama: 'Transfer BCA', tipe: 'transfer', bukti: null, status: 'lunas', alasanTolak: null, tanggalBayar: daysAgo(14) }, 15),
    mkPesanan('ps-2', 'INV-0002', 'u-p2', [item('l-prem', 'bm-4', 1, ['l-unyel'])], 'selesai', { metodeId: 'jp-tunai', metodeNama: 'Tunai', tipe: 'tunai', bukti: null, status: 'lunas', alasanTolak: null, tanggalBayar: daysAgo(7) }, 8),
    mkPesanan('ps-3', 'INV-0003', 'u-p3', [item('l-leather', 'bm-6', 1, [])], 'diproses', { metodeId: 'jp-bca', metodeNama: 'Transfer BCA', tipe: 'transfer', bukti: null, status: 'menunggu_verifikasi', alasanTolak: null, tanggalBayar: daysAgo(2) }, 3),
    mkPesanan('ps-4', 'INV-0004', 'u-p1', [item('l-std', 'bm-2', 1, ['l-repel']), item('l-prem', 'bm-7', 1, [])], 'diterima', null, 1),
  ];

  const ulasan: Ulasan[] = [
    { id: 'ul-1', nama: 'Andhakir', rating: 5, teks: 'Layanan Laundry Sepatu ini hasilnya bersih maksimal. Terima kasih atas pelayanannya.', tanggal: daysAgo(2) },
    { id: 'ul-2', nama: 'Fredi Saputro', rating: 5, teks: 'Sneakers kesayangan yang sudah kotor dan kusam kembali bersih mengkilap setelah dicuci di sini. Sol sepatu dibersihkan hingga ke sela-sela terkecil tanpa merusak bahan.', tanggal: daysAgo(2) },
    { id: 'ul-3', nama: 'R. Taufiq NM', rating: 5, teks: 'Layanan Laundry Sepatu ini hasilnya bersih maksimal. Sangat direkomendasikan.', tanggal: daysAgo(2) },
    { id: 'ul-4', nama: 'RM. Ario Tedjo Bedjo S', rating: 5, teks: 'Layanan Laundry Sepatu ini pengerjaannya rapi dan cepat. Layanan seperti ini yang saya cari.', tanggal: daysAgo(1) },
  ];

  return { users, layanan, bahanModel, jenisPembayaran, pesanan, ulasan, laporan: [], session: null };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function getDB(): DB {
  if (typeof window === 'undefined') return seed();
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = seed();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  return JSON.parse(raw) as DB;
}

export function saveDB(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('db-changed'));
}

// ---------- helpers ----------
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function nextNomorFaktur(db: DB): string {
  const n = db.pesanan.length + 1;
  return `INV-${String(n).padStart(4, '0')}`;
}

// Auth
export function login(email: string, password: string): User | null {
  const db = getDB();
  const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (u) {
    db.session = { userId: u.id };
    saveDB(db);
  }
  return u ?? null;
}

export function logout() {
  const db = getDB();
  db.session = null;
  saveDB(db);
}

export function currentUser(): User | null {
  const db = getDB();
  if (!db.session) return null;
  return db.users.find((x) => x.id === db.session!.userId) ?? null;
}

export function register(data: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: User['role'] }): { ok: boolean; error?: string; user?: User } {
  const db = getDB();
  if (!data.nama.trim()) return { ok: false, error: 'Nama wajib diisi' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return { ok: false, error: 'Format email tidak valid' };
  if (data.password.length < 6) return { ok: false, error: 'Password minimal 6 karakter' };
  if (db.users.some((x) => x.email.toLowerCase() === data.email.toLowerCase())) return { ok: false, error: 'Email sudah terdaftar' };
  const user: User = { ...data, id: uid('u'), role: data.role ?? 'pelanggan', createdAt: new Date().toISOString() };
  db.users.push(user);
  saveDB(db);
  return { ok: true, user };
}

export const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
