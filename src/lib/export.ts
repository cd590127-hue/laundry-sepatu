import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface KolomLaporan {
  header: string;
  key: string;
}

export function exportPDF(judul: string, subtitle: string, kolom: KolomLaporan[], rows: Record<string, string | number>[], namaFile: string) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(judul, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(subtitle, 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [kolom.map((k) => k.header)],
    body: rows.map((r) => kolom.map((k) => String(r[k.key] ?? ''))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [2, 132, 199] },
  });
  doc.save(namaFile);
}

export function exportExcel(kolom: KolomLaporan[], rows: Record<string, string | number>[], namaFile: string, namaSheet = 'Laporan') {
  const data = rows.map((r) => {
    const obj: Record<string, string | number> = {};
    kolom.forEach((k) => (obj[k.header] = r[k.key]));
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, namaSheet);
  XLSX.writeFile(wb, namaFile);
}

export function cetakHalaman() {
  window.print();
}
