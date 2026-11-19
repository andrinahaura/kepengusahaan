import { detailUrl } from "../data/api.js";
import { kiosId, PETA_CONTOH } from "../data/peta-contoh.js";
import { esc } from "../lib/format.js";
import { createMap, pinEl } from "../ui/map.js";
import { statusOp } from "../ui/status.js";

/* Peta terminal (dipakai di beranda & halaman Peta): satu pin per terminal.
   Klik pin → kartu mengambang di dekat pin berisi nama terminal, jumlah kios (objek komersial),
   dan dropdown daftar kios beserta statusnya. Kios titik contoh (dummy) menaut ke halaman kios/detail. */

// Status kios = status tarif sewanya; kios tanpa tarif ditandai abu-abu.
const KIOS_DOT = { Tersedia: "bg-info", Tersewa: "bg-ok", "Dalam proses": "bg-warn" };

// Tampilan awal: seluruh Pulau Jawa (Ujung Kulon–Selat Bali, pantai utara–selatan).
// Peta kini setinggi sisa layar pertama, jadi Jawa dimuatkan utuh; di layar lebar sisi kiri/kanan sedikit lebih luas.
const JAWA = [
  [105.1, -8.8],
  [114.7, -5.9],
];

const chevron =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

/** Satu baris kios. Kios contoh tidak punya halaman detail, jadi bukan tautan. */
const kiosRow = (k) => {
  const tag = k.href ? "a" : "div";
  return `
      <li>
        <${tag} class="pop-item" ${k.href ? `href="${k.href}"` : ""}>
          <span class="min-w-0 flex-1">
            <span class="pop-item-name">${esc(k.nama)}</span>
            <span class="pop-item-sub">${esc([k.klasifikasi, k.lokasi].filter(Boolean).join(" · "))}</span>
          </span>
          <span class="pop-status"><span class="size-1.5 rounded-full ${KIOS_DOT[k.status] || "bg-grey"}"></span>${esc(k.status)}</span>
        </${tag}>
      </li>`;
};

/** t = { id, tipe, nama, provinsi, status, kios[], href|null, contoh } */
function popHtml(t) {
  const listId = `kios-${t.id}`;
  return `
    <div class="pop">
      <div class="pop-head">
        <p class="pop-kicker">${esc([t.tipe, t.provinsi].filter(Boolean).join(" · "))}</p>
        <p class="pop-title">${esc(t.nama)}</p>
        <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span class="pop-count">${t.kios.length} kios</span>
          ${statusOp(t.status)}
        </div>
      </div>
      ${
        t.kios.length
          ? `<div class="pop-drop">
              <button type="button" class="pop-toggle" data-pop-toggle aria-expanded="false" aria-controls="${listId}">
                Daftar kios <span class="pop-chevron">${chevron}</span>
              </button>
              <ul id="${listId}" class="pop-list" hidden>${t.kios.map(kiosRow).join("")}</ul>
            </div>`
          : `<p class="pop-empty">Belum ada kios terdata di terminal ini.</p>`
      }
      ${
        t.href
          ? `<a class="pop-cta" href="${t.href}">Lihat detail terminal <span aria-hidden="true">→</span></a>`
          : '<div class="h-3"></div>'
      }
    </div>`;
}

/** Terminal asli (data publik) + titik contoh di Jawa, disatukan ke bentuk yang sama. */
export function terminalList(d) {
  const sewaByObjek = new Map();
  for (const s of d.sewa) if (!sewaByObjek.has(s.objekId)) sewaByObjek.set(s.objekId, s);
  return [
    ...d.profil.map((a) => ({
      ...a,
      href: detailUrl("aset", a.id),
      kios: d.related(a.id).objek.map((k) => ({
        ...k,
        status: sewaByObjek.get(k.id)?.status ?? "Belum ada tarif",
        href: detailUrl("objek", k.id),
      })),
    })),
    // Titik contoh: kiosnya menaut ke halaman detail kios (kios/detail), terminalnya belum punya detail.
    ...PETA_CONTOH.map((t) => ({
      ...t,
      href: null,
      contoh: true,
      kios: t.kios.map((k) => ({ ...k, href: detailUrl("kios", kiosId(t, k)) })),
    })),
  ];
}

/**
 * Pasang peta terminal (pin + kartu mengambang + dropdown kios) di `container`.
 * `safe()` → ruang aman {top, right, bottom, left} di dalam peta yang tidak boleh ditutupi kartu.
 * `fit(map)` → atur tampilan awal. Mengembalikan Promise { map, open(i), reset() } atau null.
 */
export function mountTerminalMap({ container, terminals, safe, fit }) {
  const frameEl = document.getElementById(container);
  const markers = [];
  let map;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setActive = (i) => markers.forEach((m, j) => m?.getElement().classList.toggle("active", j === i));

  /** Geser peta seperlunya supaya kartu mengambang tidak terpotong tepi peta atau tertutup elemen lain. */
  const keepInView = (popup) => {
    const el = popup.getElement();
    if (!map || !el) return;
    const box = el.getBoundingClientRect();
    const frame = frameEl.getBoundingClientRect();
    const pad = safe();
    let dx = 0;
    let dy = 0;
    if (box.top < frame.top + pad.top) dy = box.top - (frame.top + pad.top);
    else if (box.bottom > frame.bottom - pad.bottom) dy = box.bottom - (frame.bottom - pad.bottom);
    if (box.left < frame.left + pad.left) dx = box.left - (frame.left + pad.left);
    else if (box.right > frame.right - pad.right) dx = box.right - (frame.right - pad.right);
    if (dx || dy) map.panBy([dx, dy], { duration: reduce() ? 0 : 300 });
  };

  const closeAll = () => markers.forEach((m) => m?.getPopup().isOpen() && m.togglePopup());

  // Dropdown daftar kios di dalam kartu (kartu dibuat ulang tiap dibuka, jadi pakai delegasi).
  frameEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pop-toggle]");
    if (!btn) return;
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
    const m = markers.find((mk) => mk?.getPopup().isOpen());
    if (open && m) keepInView(m.getPopup());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const i = markers.findIndex((m) => m?.getPopup().isOpen());
    if (i < 0) return;
    closeAll();
    markers[i].getElement().focus();
  });

  return createMap(container).then((res) => {
    if (!res) return null;
    ({ map } = res);
    const { Marker, Popup } = res.lib;

    terminals.forEach((t, i) => {
      if (t.lat == null) return;
      const el = pinEl(`${t.nama}, ${t.kios.length} kios`, t.kios.length);
      el.title = t.nama;
      const popup = new Popup({
        anchor: "bottom",
        offset: 54, // tinggi pin + jarak
        className: "pin-pop",
        closeButton: true,
        maxWidth: "320px",
        focusAfterOpen: false,
      }).setHTML(popHtml(t));
      popup.on("open", () => {
        setActive(i);
        frameEl.dispatchEvent(new CustomEvent("terminal:open", { detail: i }));
        // Tunggu kartu terpasang & peta selesai bergerak sebelum mengukur.
        requestAnimationFrame(() => (map.isMoving() ? map.once("moveend", () => keepInView(popup)) : keepInView(popup)));
      });
      popup.on("close", () => {
        markers[i].getElement().classList.remove("active");
        frameEl.dispatchEvent(new CustomEvent("terminal:close", { detail: i }));
      });
      markers[i] = new Marker({ element: el, anchor: "bottom" }).setLngLat([t.lng, t.lat]).setPopup(popup).addTo(map);
    });

    fit(map, false);

    return {
      map,
      /** Terbang ke terminal ke-i lalu buka kartunya. */
      open(i) {
        const t = terminals[i];
        if (!markers[i]) return;
        closeAll();
        const pad = safe();
        // Pin diletakkan di bawah tengah area aman supaya kartu (di atas pin) muat.
        map.flyTo({
          center: [t.lng, t.lat],
          zoom: Math.max(map.getZoom(), 11),
          offset: [(pad.left - pad.right) / 2, 150 + (pad.top - pad.bottom) / 2],
          duration: reduce() ? 0 : 900,
        });
        markers[i].togglePopup();
      },
      /** Kembali ke tampilan awal. */
      reset() {
        closeAll();
        fit(map, !reduce());
      },
    };
  });
}

/** Peta beranda: tampilan awal seluruh Pulau Jawa. */
export function initPeta(d) {
  mountTerminalMap({
    container: "map",
    terminals: terminalList(d),
    // Atas tertutup KPI & efek pudar, bawah ada pudar ke latar.
    safe: () => ({ top: 84, right: 16, bottom: 24, left: 16 }),
    fit: (map, animate) =>
      map.fitBounds(JAWA, { padding: { top: 96, right: 12, bottom: 32, left: 12 }, duration: animate ? 600 : 0 }),
  });
}
