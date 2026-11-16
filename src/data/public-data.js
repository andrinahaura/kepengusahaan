/* ============================================================
   DATA PUBLIK
   Snapshot dari dashboard internal (e-kepengusahaan-dev), 10 Nov 2026.
   Hanya modul dengan akses "Public" di matriks hak akses:
   Data Profil (R), Objek Komersial (R), Nilai Sewa (R),
   Proyek KSP dsj. (P, sebagian), KPBU (R*, terbatas),
   Knowledge Base (R), Klinik Hub (Submit).
   Koordinat aset = perkiraan lokasi kota, ganti dengan koordinat asli.
   ============================================================ */
export const DATA = {
  updatedAt: "2026-11-10",
  profil: [
    { tipe: "Terminal A", nama: "LHOKSEUMAWE (TERMINAL LHOKSEUMAWE)", bptd: "BPTD Kelas II Aceh", luas: 14000, kondisi: null, status: "Operasional", lat: 5.1801, lng: 97.1507 },
    { tipe: "Terminal A", nama: "TERMINAL AMPLAS", bptd: "BPTD Kelas II Sumatera Utara", luas: 20161, kondisi: "Baik", status: "Operasional", lat: 3.5375, lng: 98.7175 },
    { tipe: "Terminal A", nama: "BANGKALAN", bptd: "BPTD Kelas II Jawa Timur", luas: 1500, kondisi: "Baik", status: "Tidak Operasional", lat: -7.0306, lng: 112.7469 },
  ],
  objekKomersial: [
    { nama: "[UJI] Ruang Komersial Terminal", kodeBarang: "4010101001", nup: "1", bptd: "BPTD Kelas II Jawa Timur", skema: "Sewa", klasifikasi: "Kios", lokasi: "Area Kedatangan", luas: 120, kondisi: "Baik" },
  ],
  nilaiSewa: [
    { objek: "[UJI] Ruang Komersial Terminal", nilai: 12000000, jangkaWaktu: "15 hari", status: "Tersedia" },
  ],
  proyekKsp: [
    // Hanya kolom Project Registry yang dipublikasikan (tanpa proyeksi keuangan).
    { nama: "[UJI] Proyek KSP Terminal", aset: "BANGKALAN", skema: "KSP", pemrakarsa: "Pemerintah", tahunKajian: null, jangkaWaktu: null, statusData: "Terverifikasi" },
    { nama: "123", aset: "BANGKALAN", skema: "KSP", pemrakarsa: "Pemerintah", tahunKajian: null, jangkaWaktu: null, statusData: "Draf" },
  ],
  kpbu: [
    { id: "PRJ-0012", nama: "test", aset: "TERMINAL AMPLAS", skema: "Solicited", tahap: "Penyiapan", investasi: 123, aktif: true, statusData: "Diajukan" },
    { id: "PRJ-0011", nama: "Test", aset: "BANGKALAN", skema: "Solicited", tahap: "Perencanaan", investasi: 123123, aktif: true, statusData: "Terverifikasi" },
    { id: "PRJ-0010", nama: "[UJI] Proyek KPBU Terminal", aset: "BANGKALAN", skema: "Solicited", tahap: "Perencanaan", investasi: 150000000000, aktif: true, statusData: "Terverifikasi" },
  ],
  knowledgeBase: {
    kategori: ["FAQ", "Artikel", "Regulasi", "SOP", "Template"],
    dokumen: [
      { judul: "TEST", kategori: "FAQ", tipe: "PDF", url: "#" },
      { judul: "sample.pdf", kategori: "Artikel", tipe: "PDF", url: "#" },
    ],
  },
};
