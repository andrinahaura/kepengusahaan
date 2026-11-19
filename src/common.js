import "@fontsource-variable/plus-jakarta-sans";
import "./styles/main.css";

import { loadPublicData } from "./data/api.js";
import { fmtDate } from "./lib/format.js";
import { initNav } from "./features/nav.js";
import { hydrateMapThumbs } from "./ui/map-thumbs.js";

/**
 * Inisialisasi yang sama untuk semua halaman (font, CSS, navbar, footer),
 * lalu jalankan `render` milik halaman dengan data publik.
 */
export function bootPage(render) {
  initNav();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  if (!render) return;
  loadPublicData()
    .then((d) => {
      // Tanggal pembaruan data di kepala halaman menu.
      const date = document.getElementById("dataDate");
      if (date) {
        date.textContent = fmtDate(d.updatedAt);
        date.dateTime = d.updatedAt;
      }
      render(d);
      // Gambar peta di kartu dibuat setelah kartu tampil.
      hydrateMapThumbs();
    })
    .catch((err) => console.error("Gagal memuat data publik:", err));
}
