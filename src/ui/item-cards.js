import { detailUrl, KPBU_TAHAP } from "../data/api.js";
import { esc, nf, rupiah } from "../lib/format.js";
import { action, chip, facts, meta, tanya } from "./cards.js";
import { media } from "./media.js";

/* Kartu katalog per jenis data. Dipakai di halaman menu dan di bagian "terkait" halaman detail.
   Seluruh kartu menaut ke halaman detail. */

/* Judul berisi link "melebar" (lihat .item-link di CSS): area klik menutupi seluruh kartu,
   sementara tombol di kaki kartu tetap bisa diklik sendiri. */
const title = (type, id, text, extra = "") =>
  `<h2 class="item-title ${extra}"><a class="item-link" href="${detailUrl(type, id)}">${esc(text)}</a></h2>`;

export const SEWA_TONE = { Tersedia: "info", Tersewa: "ok" };

export const asetCard = (r) => `
  <article class="item-card">
    ${media({ foto: r.foto, coord: r.coord, alt: r.nama, fallbackIcon: "building" }, chip(r.status, r.status === "Operasional" ? "ok" : "grey"))}
    <p class="item-kicker">${esc(r.tipe)}</p>
    ${title("aset", r.id, r.nama)}
    ${meta("pin", `${r.bptd} · ${r.provinsi}`)}
    ${facts([
      ["Luas lahan", `${nf.format(r.luas)} m²`],
      ["Luas bangunan", r.luasBangunan != null ? `${nf.format(r.luasBangunan)} m²` : null],
    ])}
    <div class="item-foot">
      ${r.lat != null ? action(`https://www.google.com/maps?q=${r.lat},${r.lng}`, "Buka di peta", { external: true }) : ""}
      ${action(tanya(`Informasi aset ${r.nama}`), "Tanya aset ini")}
    </div>
  </article>`;

export const objekCard = (r) => `
  <article class="item-card">
    ${media({ foto: r.foto, coord: r.coord, alt: r.nama, fallbackIcon: "tag" }, chip(r.skema, "primary"))}
    <p class="item-kicker">${esc(r.klasifikasi)}</p>
    ${title("objek", r.id, r.nama)}
    ${meta("pin", `${r.lokasi} · ${r.aset}, ${r.provinsi}`)}
    ${facts([
      ["Luas", `${nf.format(r.luas)} m²`],
      ["Kondisi", r.kondisi],
    ])}
    <p class="mt-3 text-xs text-muted-foreground tabular-nums">Kode barang ${esc(r.kodeBarang)} · NUP ${esc(r.nup)}</p>
    <div class="item-foot">${action(tanya(`Pemanfaatan ${r.nama}`), "Tanya pemanfaatan")}</div>
  </article>`;

export const sewaCard = (r) => `
  <article class="item-card">
    ${media({ foto: r.foto, coord: r.coord, alt: r.objek, fallbackIcon: "wallet" }, chip(r.status, SEWA_TONE[r.status] || "grey"))}
    ${title("sewa", r.id, r.objek, "mt-4")}
    <p class="mt-3 text-heading-sm font-semibold text-primary tabular-nums">${rupiah(r.nilai)}</p>
    <p class="text-sm text-muted-foreground">Tarif ${esc((r.periode || "").toLowerCase())} · jangka waktu ${esc(r.jangkaWaktu)}</p>
    <div class="item-foot">${action(tanya(`Minat sewa ${r.objek}`), r.status === "Tersedia" ? "Ajukan minat sewa" : "Tanya objek ini")}</div>
  </article>`;

export const kspCard = (r) => `
  <article class="item-card">
    ${media({ foto: r.foto, coord: r.coord, alt: r.nama, fallbackIcon: "layers" }, chip(r.skema, "primary"))}
    ${title("ksp", r.id, r.nama, "mt-4")}
    ${meta("building", r.aset)}
    ${facts([
      ["Pemrakarsa", r.pemrakarsa],
      ["Tahun kajian", r.tahunKajian],
      ["Jangka waktu", r.jangkaWaktu],
    ])}
    <div class="item-foot">${action(tanya(`Proyek ${r.nama}`), "Tanya proyek ini")}</div>
  </article>`;

/** Progres tahap KPBU: 6 ruas, terisi sampai tahap saat ini. */
export const tahapBar = (tahap) => {
  const n = KPBU_TAHAP.indexOf(tahap) + 1;
  const bar = KPBU_TAHAP.map((t, i) => `<span class="h-1.5 flex-1 rounded-full ${i < n ? "bg-primary" : "bg-muted"}" title="${esc(t)}"></span>`).join("");
  return `
    <div class="mt-4">
      <p class="text-xs font-semibold">Tahap ${n}/${KPBU_TAHAP.length}: ${esc(tahap)}</p>
      <div class="mt-2 flex gap-1" role="img" aria-label="Tahap ${n} dari ${KPBU_TAHAP.length}: ${esc(tahap)}">${bar}</div>
    </div>`;
};

export const kpbuCard = (r) => `
  <article class="item-card">
    ${media({ foto: r.foto, coord: r.coord, alt: r.nama, fallbackIcon: "flag" }, chip(r.aktif ? "Aktif" : "Tidak aktif", r.aktif ? "ok" : "grey"))}
    <p class="item-kicker">${esc(r.id)} · ${esc(r.skema)}</p>
    ${title("kpbu", r.id, r.nama)}
    ${meta("building", r.aset)}
    ${tahapBar(r.tahap)}
    ${facts([
      ["Nilai investasi", rupiah(r.investasi)],
      ["Masa konsesi", r.masaKonsesi],
    ])}
    <div class="item-foot">${action(tanya(`Proyek KPBU ${r.id} ${r.nama}`), "Tanya proyek ini")}</div>
  </article>`;
