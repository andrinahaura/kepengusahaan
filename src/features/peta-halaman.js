import { $, $$ } from "../lib/dom.js";
import { esc } from "../lib/format.js";
import { mountTerminalMap, terminalList } from "./peta.js";

/* Halaman Peta: peta penuh + kartu daftar terminal yang dikelompokkan per wilayah (provinsi).
   Wilayah diurutkan dari barat ke timur. Klik terminal di kartu → peta terbang ke pin & membuka kartunya. */

const wide = () => matchMedia("(min-width: 1024px)").matches;

/** Kelompokkan terminal per provinsi, urut barat → timur (rata-rata bujur), terminal di dalamnya juga barat → timur. */
function byWilayah(terminals) {
  const groups = new Map();
  terminals.forEach((t, i) => {
    const key = t.provinsi || "Lainnya";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ t, i });
  });
  const avgLng = (list) => list.reduce((s, { t }) => s + (t.lng ?? 0), 0) / list.length;
  return [...groups.entries()]
    .map(([nama, list]) => ({ nama, list: list.sort((a, b) => (a.t.lng ?? 0) - (b.t.lng ?? 0)) }))
    .sort((a, b) => avgLng(a.list) - avgLng(b.list));
}

const row = ({ t, i }) => `
  <li>
    <button type="button" class="wilayah-row" data-terminal="${i}" ${t.lat == null ? "disabled" : ""}>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold text-foreground">${esc(t.nama)}</span>
        <span class="mt-0.5 block text-xs text-muted-foreground">${esc(t.tipe || "Terminal")}</span>
      </span>
      <span class="wilayah-kios">${t.kios.length} kios</span>
    </button>
  </li>`;

export function initPetaHalaman(d) {
  const terminals = terminalList(d);
  const wilayah = byWilayah(terminals);

  $("#wilayahMeta").textContent = `${terminals.length} terminal · ${wilayah.length} wilayah`;
  $("#wilayahList").innerHTML = wilayah
    .map(
      (w) => `
      <details class="wilayah-group" open>
        <summary class="wilayah-sum">
          <span>${esc(w.nama)}</span>
          <span class="flex items-center gap-2 text-xs font-semibold text-muted-foreground">${w.list.length}
            <svg class="wilayah-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </summary>
        <ul class="grid grid-cols-1 gap-1 px-1.5 pb-2">${w.list.map(row).join("")}</ul>
      </details>`,
    )
    .join("");

  const card = $(".wilayah-card");
  // Ruang yang tertutup navbar (atas) dan kartu wilayah (kiri, hanya di layar lebar).
  const safe = () => ({
    top: 84,
    right: 16,
    bottom: 16,
    left: wide() ? Math.round(card.getBoundingClientRect().right - $("#petaMap").getBoundingClientRect().left) + 16 : 16,
  });

  const pts = terminals.filter((t) => t.lat != null);
  const fit = (map, animate) => {
    const lngs = pts.map((t) => t.lng);
    const lats = pts.map((t) => t.lat);
    const pad = safe();
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: { top: pad.top + 56, right: pad.right + 48, bottom: pad.bottom + 48, left: pad.left + 48 }, maxZoom: 9, duration: animate ? 700 : 0 },
    );
  };

  const setRow = (i) => $$("[data-terminal]").forEach((b) => b.toggleAttribute("aria-current", +b.dataset.terminal === i));

  mountTerminalMap({ container: "petaMap", terminals, safe, fit }).then((api) => {
    if (!api) return;
    $("#wilayahList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-terminal]");
      if (!b) return;
      // Di layar kecil kartu ada di bawah peta: gulir dulu ke peta.
      if (!wide()) $("#petaMap").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      api.open(+b.dataset.terminal);
    });
    $("#petaReset").addEventListener("click", () => api.reset());
    $("#petaMap").addEventListener("terminal:open", (e) => setRow(e.detail));
    $("#petaMap").addEventListener("terminal:close", () => setRow(-1));
  });
}
