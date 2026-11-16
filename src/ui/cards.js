import { esc } from "../lib/format.js";
import { icon } from "./icons.js";

/* Kartu katalog untuk masyarakat: nama jelas, fakta singkat berlabel, status dalam chip, satu aksi. */

const TONE = {
  ok: "bg-ok-bg text-ok-fg",
  info: "bg-info-bg text-info-fg",
  warn: "bg-warn-bg text-warn-fg",
  grey: "bg-grey-bg text-grey-fg",
  primary: "bg-accent text-primary",
};

/** Chip status/label. */
export const chip = (text, tone = "grey") => `<span class="chip ${TONE[tone] || TONE.grey}">${esc(text)}</span>`;

/** Fakta berlabel (dl). Nilai kosong ditampilkan sebagai "Belum tersedia". */
export const facts = (items) => `
  <dl class="facts">
    ${items
      .map(
        ([label, value]) => `
        <div><dt>${esc(label)}</dt><dd>${value == null || value === "" ? '<span class="text-muted-foreground">Belum tersedia</span>' : esc(value)}</dd></div>`,
      )
      .join("")}
  </dl>`;

/** Baris ikon + teks kecil (lokasi, kode, dsb.). */
export const meta = (ic, text) => `<p class="item-meta">${icon(ic, 15)}<span>${esc(text)}</span></p>`;

/** Link aksi di kaki kartu. */
export const action = (href, label, { external = false } = {}) =>
  `<a class="item-action" href="${esc(href)}" ${external ? 'target="_blank" rel="noopener"' : ""}>${esc(label)} ${icon("arrow", 15)}</a>`;

/** Isi daftar kartu, atau pesan kosong. */
export function renderCards(el, rows, cardHtml, empty = "Tidak ada data yang cocok dengan filter.") {
  el.innerHTML = rows.length
    ? rows.map(cardHtml).join("")
    : `<p class="col-span-full rounded-[24px] bg-card px-6 py-12 text-center text-sm text-muted-foreground">${esc(empty)}</p>`;
}

/** Link ke form Klinik Hub dengan subjek terisi. */
export const tanya = (subjek, kategori = "Permintaan informasi") =>
  `/klinik/?${new URLSearchParams({ kategori, subjek })}`;
