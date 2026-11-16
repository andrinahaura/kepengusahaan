import { detailUrl } from "../data/api.js";
import { $, $$ } from "../lib/dom.js";
import { esc, nf } from "../lib/format.js";
import { createMap, markerEl } from "../ui/map.js";
import { statusOp } from "../ui/status.js";

/* Peta beranda: semua aset beserta seluruh data yang terhubung (objek komersial, sewa, KSP, KPBU).
   Klik aset → popup berisi semua item; setiap item menautkan ke halaman detail menunya. */

const GROUPS = [
  ["objek", "Objek komersial", (r) => r.nama],
  ["sewa", "Nilai sewa", (r) => r.objek],
  ["ksp", "Proyek KSP dsj.", (r) => r.nama],
  ["kpbu", "Proyek KPBU", (r) => `${r.id} · ${r.nama}`],
];

const countChips = (rel) =>
  GROUPS.filter(([k]) => rel[k].length)
    .map(([k, label]) => `<span class="rounded-pill bg-muted px-2 py-0.5">${esc(label.replace(/ dsj\.$/, ""))} ${rel[k].length}</span>`)
    .join("");

function popupHtml(a, rel) {
  const groups = GROUPS.filter(([k]) => rel[k].length)
    .map(
      ([k, label, name]) => `
      <p class="mt-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">${esc(label)}</p>
      <ul class="mt-1 grid gap-1">
        ${rel[k].map((r) => `<li><a class="popup-link" href="${detailUrl(k, r.id)}">${esc(name(r))}</a></li>`).join("")}
      </ul>`,
    )
    .join("");
  return `
    <div class="w-64">
      <p class="font-semibold">${esc(a.nama)}</p>
      <p class="text-muted-foreground">${esc(a.bptd)} · ${nf.format(a.luas)} m²</p>
      <p class="mt-1">${statusOp(a.status)}</p>
      ${groups || '<p class="mt-3 text-muted-foreground">Belum ada objek atau proyek terkait.</p>'}
      <a class="popup-cta" href="${detailUrl("aset", a.id)}">Lihat detail aset →</a>
    </div>`;
}

export function initPeta(d) {
  const { profil } = d;
  const markers = [];
  let map;

  const total = GROUPS.reduce((s, [k]) => s + d[k].length, 0);
  $("#asetMeta").textContent = `${profil.length} aset · ${total} data terkait`;

  // ---- daftar semua aset + jumlah data terkait ----
  $("#locList").innerHTML = profil
    .map((a, i) => {
      const rel = d.related(a.id);
      return `
      <li><button data-loc="${i}" class="w-full cursor-pointer px-5 py-4 text-left transition-colors hover:bg-muted">
        <span class="block text-sm font-semibold">${esc(a.nama)}</span>
        <span class="mt-1 flex flex-wrap justify-between gap-x-3 text-xs text-muted-foreground"><span>${esc(a.bptd)}</span>${statusOp(a.status)}</span>
        <span class="mt-2 flex flex-wrap gap-1 text-[11px] font-semibold text-muted-foreground">${countChips(rel)}</span>
      </button></li>`;
    })
    .join("");

  const setActive = (i) => {
    $$("[data-loc]").forEach((el) => el.classList.toggle("bg-accent", +el.dataset.loc === i));
    markers.forEach((m, j) => m?.getElement().classList.toggle("active", j === i));
  };

  $("#locList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-loc]");
    if (!b) return;
    const i = +b.dataset.loc;
    const a = profil[i];
    setActive(i);
    // Bawa peta memenuhi layar (KPI tepat di atas) sebelum terbang ke lokasi.
    const top = $("#stats").getBoundingClientRect().top + scrollY - 12;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (Math.abs(scrollY - top) > 4) scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    if (map && markers[i]) {
      // Geser titik ke bawah tengah supaya popup (muncul di atas titik) tidak terpotong.
      map.flyTo({ center: [a.lng, a.lat], zoom: 9, offset: [0, 160], duration: 800 });
      markers.forEach((m) => m?.getPopup().isOpen() && m.togglePopup());
      markers[i].togglePopup();
    }
  });

  createMap("map").then((res) => {
    if (!res) return;
    ({ map } = res);
    const { Marker, Popup, LngLatBounds } = res.lib;

    profil.forEach((a, i) => {
      if (a.lat == null) return;
      const el = markerEl(a.nama);
      const popup = new Popup({ anchor: "bottom", offset: 14, closeButton: true, maxWidth: "300px", focusAfterOpen: false }).setHTML(popupHtml(a, d.related(a.id)));
      markers[i] = new Marker({ element: el }).setLngLat([a.lng, a.lat]).setPopup(popup).addTo(map);
      el.addEventListener("click", () => setActive(i));
    });

    const pts = profil.filter((a) => a.lat != null);
    if (pts.length > 1) {
      const bounds = new LngLatBounds();
      pts.forEach((a) => bounds.extend([a.lng, a.lat]));
      // Di layar lebar, daftar lokasi menutupi sisi kiri peta: geser area fokus ke kanannya.
      const panel = $("#locPanel").getBoundingClientRect();
      const mapBox = $("#map").getBoundingClientRect();
      const left = matchMedia("(min-width: 1024px)").matches ? Math.round(panel.right - mapBox.left) + 56 : 56;
      map.fitBounds(bounds, { padding: { top: 180, right: 72, bottom: 96, left }, maxZoom: 7, duration: 0 });
    }
  });
}
