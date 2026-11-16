import { $ } from "../lib/dom.js";
import { esc, fmtDate, nf, rupiahShort } from "../lib/format.js";

/** Tanggal data di hero + kartu KPI. */
export function renderRingkasan(d) {
  $("#updatedAt").textContent = fmtDate(d.updatedAt);

  const stats = [
    ["Aset terminal", d.profil.length, "/aset/"],
    ["Luas lahan", nf.format(d.totals.luasLahan) + " m²", "/aset/"],
    ["Objek komersial", d.objek.length, "/objek/"],
    ["Tersedia disewa", d.totals.tersedia, "/sewa/"],
    ["Proyek KSP dsj.", d.ksp.length, "/ksp/"],
    ["Investasi KPBU", rupiahShort(d.totals.investasi), "/kpbu/"],
  ];
  $("#stats").innerHTML = stats
    .map(
      ([label, value, href]) => `
      <a href="${href}" class="group/stat block min-w-[170px] flex-1 px-6 py-5 transition-colors first:rounded-l-card last:rounded-r-card hover:bg-muted">
        <dt class="text-xs font-semibold text-muted-foreground group-hover/stat:text-foreground">${label}</dt>
        <dd class="mt-2 text-heading-sm font-semibold whitespace-nowrap tabular-nums">${esc(value)}</dd>
      </a>`,
    )
    .join("");
}
