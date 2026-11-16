# Data Kepengusahaan Aset Terminal

Halaman publik data kepengusahaan aset terminal (Ditjen Perhubungan Darat).
Dibangun dengan Vite, Tailwind CSS v4, dan MapLibre GL. Gaya visual mengikuti `design.md`.

## Menjalankan

```bash
npm install
npm run dev       # server pengembangan di http://localhost:5173
npm run build     # hasil produksi ke folder dist/
npm run preview   # cek hasil build secara lokal
```

## Struktur

Situs multi-halaman. Setiap menu punya halaman sendiri:

| URL          | File                  | Isi                               |
|--------------|-----------------------|-----------------------------------|
| `/`          | `index.html`          | Beranda: hero, KPI, peta semua aset + data terkait |
| `/aset/`     | `aset/index.html`     | Tabel profil aset + filter        |
| `/objek/`    | `objek/index.html`    | Objek komersial                   |
| `/sewa/`     | `sewa/index.html`     | Nilai sewa                        |
| `/ksp/`      | `ksp/index.html`      | Proyek KSP dsj.                   |
| `/kpbu/`     | `kpbu/index.html`     | Proyek KPBU                       |
| `/dokumen/`  | `dokumen/index.html`  | Dokumen                           |
| `/klinik/`   | `klinik/index.html`   | Form Klinik Hub                   |
| `/<menu>/detail/?id=…` | `<menu>/detail/index.html` | Detail satu aset, objek, sewa, proyek KSP, atau KPBU |

```
partials/               head, navbar, footer; disisipkan lewat <!-- @include nama.html -->
public/                 file statis (favicon, foto beranda)
src/
  common.js             font, CSS, navbar, footer untuk semua halaman
  pages/                satu entry JS per halaman
  features/             logika tiap bagian (peta, profil, komersial, proyek, dokumen, klinik, nav)
  data/                 snapshot data publik + loadPublicData()
  lib/, ui/             helper format, DOM, status, tabel
  styles/main.css       token design.md (@theme) dan komponen Tailwind
```

Menambah halaman: buat `<slug>/index.html` (salin dari halaman lain), buat `src/pages/<slug>.js`,
daftarkan slug di `PAGES` pada `vite.config.js`, lalu tambahkan link di `partials/header.html`.

## Catatan

- Data masih berupa snapshot di `src/data/public-data.js`. Untuk data live, ubah `loadPublicData()` di `src/data/api.js`.
- Form Klinik Hub belum terhubung ke backend (lihat TODO di `src/features/klinik.js`).
- Gambar latar hero adalah ilustrasi SVG di `index.html`. Untuk foto sendiri, simpan di `public/` lalu ganti `<svg id="heroArt">` dengan `<img>`.
