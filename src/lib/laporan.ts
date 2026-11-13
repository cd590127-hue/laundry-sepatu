import { getDB, rupiah, formatTanggal, Pesanan, User } from '@/lib/store';
import { KolomLaporan } from '@/lib/export';

export type JenisLaporan = 'pemesanan' | 'keuangan' | 'pelanggan';

export const jenisLaporanList: { key: JenisLaporan; label: string }[] = [
  { key: 'pemesanan', label: 'Laporan Pemesanan' },
  { key: 'keuangan', label: 'Laporan Keuangan' },
  { key: 'pelanggan', label: 'Laporan Data Pelanggan' },
];

export interface HasilLaporan {
  kolom: KolomLaporan[];
  rows: Record<string, string | number>[];
  ringkasan: string;
}

function inPeriode(iso: string, mulai: string, selesai: string): boolean {
  const t = iso.slice(0, 10);
  return t >= mulai && t <= selesai;
}

export function generateLaporan(jenis: JenisLaporan, mulai: string, selesai: string): HasilLaporan {
  const db = getDB();

  if (jenis === 'pemesanan') {
    const data = db.pesanan.filter((p) => inPeriode(p.createdAt, mulai, selesai));
    return {
      kolom: [
        { header: 'No. Faktur', key: 'faktur' },
        { header: 'Tanggal', key: 'tanggal' },
        { header: 'Pelanggan', key: 'pelanggan' },
        { header: 'Layanan', key: 'layanan' },
        { header: 'Total', key: 'total' },
        { header: 'Status Pesanan', key: 'status' },
        { header: 'Status Bayar', key: 'bayar' },
      ],
      rows: data.map((p: Pesanan) => ({
        faktur: p.nomorFaktur,
        tanggal: formatTanggal(p.createdAt),
        pelanggan: p.pelangganNama,
        layanan: p.items.map((i) => `${i.layananNama} x${i.jumlah}`).join('; '),
        total: rupiah(p.total),
        status: p.status,
        bayar: p.pembayaran?.status ?? 'belum_bayar',
      })),
      ringkasan: `Total ${data.length} pesanan pada periode ini.`,
    };
  }

  if (jenis === 'keuangan') {
    const data = db.pesanan.filter((p) => p.pembayaran?.status === 'lunas' && inPeriode(p.pembayaran.tanggalBayar ?? p.createdAt, mulai, selesai));
    const totalPemasukan = data.reduce((s, p) => s + p.total, 0);
    return {
      kolom: [
        { header: 'No. Faktur', key: 'faktur' },
        { header: 'Tanggal Bayar', key: 'tanggal' },
        { header: 'Pelanggan', key: 'pelanggan' },
        { header: 'Metode', key: 'metode' },
        { header: 'Jumlah', key: 'jumlah' },
      ],
      rows: data.map((p: Pesanan) => ({
        faktur: p.nomorFaktur,
        tanggal: p.pembayaran?.tanggalBayar ? formatTanggal(p.pembayaran.tanggalBayar) : '-',
        pelanggan: p.pelangganNama,
        metode: p.pembayaran?.metodeNama ?? '-',
        jumlah: rupiah(p.total),
      })),
      ringkasan: `Total pemasukan: ${rupiah(totalPemasukan)} dari ${data.length} transaksi lunas.`,
    };
  }

  // pelanggan
  const data = db.users.filter((u) => u.role === 'pelanggan' && inPeriode(u.createdAt, mulai, selesai));
  return {
    kolom: [
      { header: 'Nama', key: 'nama' },
      { header: 'Email', key: 'email' },
      { header: 'Telepon', key: 'telepon' },
      { header: 'Alamat', key: 'alamat' },
      { header: 'Terdaftar', key: 'terdaftar' },
      { header: 'Jumlah Pesanan', key: 'pesanan' },
    ],
    rows: data.map((u: User) => ({
      nama: u.nama,
      email: u.email,
      telepon: u.telepon,
      alamat: u.alamat,
      terdaftar: formatTanggal(u.createdAt),
      pesanan: db.pesanan.filter((p) => p.pelangganId === u.id).length,
    })),
    ringkasan: `Total ${data.length} pelanggan terdaftar pada periode ini.`,
  };
}
