import { $ } from "../lib/dom.js";
import { renderCards } from "../ui/cards.js";
import { objekCard, sewaCard } from "../ui/item-cards.js";

/** Katalog objek komersial. */
export function renderObjek(d) {
  $("#listMeta").textContent = `${d.objek.length} objek komersial`;
  renderCards($("#list"), d.objek, objekCard, "Belum ada objek komersial.");
}

/** Katalog nilai sewa. */
export function initSewa(d) {
  $("#listMeta").textContent = `${d.sewa.length} objek sewa · ${d.totals.tersedia} tersedia`;
  renderCards($("#list"), d.sewa, sewaCard, "Belum ada data nilai sewa.");
}
