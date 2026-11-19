/* ============================================================
   TITIK CONTOH (DUMMY) UNTUK PETA BERANDA
   Hanya untuk memperlihatkan tampilan peta dengan banyak terminal di Pulau Jawa.
   Nama & koordinat terminal mengikuti lokasi nyata, tetapi daftar kios dan statusnya REKAAN.
   Tidak dihitung di KPI, kartu, atau halaman menu; di peta tidak punya tautan ke halaman detail.
   Hapus file ini (dan impornya di src/features/peta.js & detail.js, serta halaman kios/detail) saat data asli sudah tersedia.
   ============================================================ */

const kios = (prefix, statuses) =>
  statuses.map((status, i) => ({
    kode: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    nama: `Kios ${prefix}-${String(i + 1).padStart(2, "0")}`,
    klasifikasi: "Kios",
    lokasi: i % 2 ? "Area Kedatangan" : "Area Keberangkatan",
    status,
  }));

/** Id kios contoh untuk URL detail: "<id terminal>~<kode kios>", mis. "contoh-pulo-gebang~PG-01". */
export const kiosId = (terminal, k) => `${terminal.id}~${k.kode}`;

export const PETA_CONTOH = [
  {
    id: "contoh-pulo-gebang",
    tipe: "Terminal A",
    nama: "TERMINAL PULO GEBANG",
    provinsi: "DKI Jakarta",
    status: "Operasional",
    lat: -6.212,
    lng: 106.9524,
    kios: kios("PG", ["Tersewa", "Tersewa", "Tersedia", "Tersewa", "Dalam proses", "Tersedia"]),
  },
  {
    id: "contoh-harjamukti",
    tipe: "Terminal A",
    nama: "TERMINAL HARJAMUKTI",
    provinsi: "Jawa Barat",
    status: "Operasional",
    lat: -6.7406,
    lng: 108.5662,
    kios: kios("HM", ["Tersewa", "Tersedia", "Tersedia"]),
  },
  {
    id: "contoh-mangkang",
    tipe: "Terminal A",
    nama: "TERMINAL MANGKANG",
    provinsi: "Jawa Tengah",
    status: "Operasional",
    lat: -6.9706,
    lng: 110.2995,
    kios: kios("MK", ["Tersewa", "Tersewa", "Dalam proses", "Tersedia"]),
  },
  {
    id: "contoh-giwangan",
    tipe: "Terminal A",
    nama: "TERMINAL GIWANGAN",
    provinsi: "DI Yogyakarta",
    status: "Operasional",
    lat: -7.8338,
    lng: 110.3925,
    kios: kios("GW", ["Tersewa", "Tersedia", "Tersewa", "Tersewa", "Tersedia"]),
  },
  {
    id: "contoh-arjosari",
    tipe: "Terminal A",
    nama: "TERMINAL ARJOSARI",
    provinsi: "Jawa Timur",
    status: "Operasional",
    lat: -7.9335,
    lng: 112.6576,
    kios: kios("AJ", ["Tersedia", "Tersewa"]),
  },
  {
    id: "contoh-tawang-alun",
    tipe: "Terminal A",
    nama: "TERMINAL TAWANG ALUN",
    provinsi: "Jawa Timur",
    status: "Operasional",
    lat: -8.1585,
    lng: 113.6976,
    kios: kios("TA", ["Tersewa", "Dalam proses", "Tersedia"]),
  },
];
