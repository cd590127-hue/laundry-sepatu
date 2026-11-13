import { StatusPesanan, StatusPembayaran } from '@/lib/store';

const statusPesananMap: Record<StatusPesanan, { label: string; cls: string }> = {
  diterima: { label: 'Diterima', cls: 'bg-blue-100 text-blue-700' },
  diproses: { label: 'Diproses', cls: 'bg-yellow-100 text-yellow-700' },
  selesai: { label: 'Selesai', cls: 'bg-green-100 text-green-700' },
  diambil: { label: 'Diambil', cls: 'bg-gray-200 text-gray-700' },
  dibatalkan: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
};

const statusBayarMap: Record<StatusPembayaran, { label: string; cls: string }> = {
  belum_bayar: { label: 'Belum Bayar', cls: 'bg-gray-100 text-gray-600' },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', cls: 'bg-yellow-100 text-yellow-700' },
  lunas: { label: 'Lunas', cls: 'bg-green-100 text-green-700' },
  ditolak: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
};

export function BadgePesanan({ status }: { status: StatusPesanan }) {
  const s = statusPesananMap[status];
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

export function BadgeBayar({ status }: { status: StatusPembayaran }) {
  const s = statusBayarMap[status];
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}
