import { $ } from "../lib/dom.js";
import { esc, fmtDate } from "../lib/format.js";
import { chip, renderCards } from "../ui/cards.js";
import { icon } from "../ui/icons.js";
import { media } from "../ui/media.js";

/** Semua dokumen sebagai kartu yang bisa diunduh. */
export function initDokumen(d) {
  const { dokumen } = d;
  $("#listMeta").textContent = `${dokumen.length} dokumen`;
  renderCards(
    $("#list"),
    dokumen,
    (x) => `
    <article class="item-card">
      ${media({ foto: x.foto, alt: x.judul, fallbackIcon: "file" }, chip(x.tipe, "primary"))}
      <p class="item-kicker">${esc(x.kategori)}</p>
      <h2 class="item-title break-words">${esc(x.judul)}</h2>
      ${x.diunggah ? `<p class="mt-1 text-sm text-muted-foreground">Diunggah ${fmtDate(x.diunggah)}</p>` : ""}
      <div class="item-foot"><a class="item-action" href="${esc(x.url)}" download>Unduh ${esc(x.tipe)} <span class="action-icon"><span class="inline-flex rotate-90">${icon("arrow", 15)}</span></span></a></div>
    </article>`,
    "Belum ada dokumen.",
  );
}
