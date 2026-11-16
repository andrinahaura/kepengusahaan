import { $ } from "../lib/dom.js";
import { renderCards } from "../ui/cards.js";
import { asetCard } from "../ui/item-cards.js";

/** Katalog aset terminal: semua aset sebagai kartu. */
export function initProfil(d) {
  $("#listMeta").textContent = `${d.profil.length} aset di ${d.totals.bptd.length} BPTD`;
  renderCards($("#list"), d.profil, asetCard, "Belum ada data aset.");
}
