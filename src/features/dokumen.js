import { $ } from "../lib/dom.js";
import { esc } from "../lib/format.js";
import { chip, renderCards } from "../ui/cards.js";
import { icon } from "../ui/icons.js";

/** Semua dokumen sebagai kartu yang bisa diunduh. */
export function initDokumen(d) {
  const { dokumen } = d;
  $("#listMeta").textContent = `${dokumen.length} dokumen`;
  renderCards(
    $("#list"),
    dokumen,
    (x) => `
    <article class="item-card">
      <div class="flex items-start justify-between gap-3">
        <span class="icon-badge">${icon("file")}</span>
        ${chip(x.tipe, "primary")}
      </div>
      <p class="item-kicker">${esc(x.kategori)}</p>
      <h2 class="item-title break-words">${esc(x.judul)}</h2>
      <div class="item-foot"><a class="btn btn-primary" href="${esc(x.url)}" download>Unduh ${esc(x.tipe)}</a></div>
    </article>`,
    "Belum ada dokumen.",
  );
}
