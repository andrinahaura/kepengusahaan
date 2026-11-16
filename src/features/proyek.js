import { $ } from "../lib/dom.js";
import { renderCards } from "../ui/cards.js";
import { kpbuCard, kspCard } from "../ui/item-cards.js";

/** Katalog proyek KSP, KSO, BSG/BGS, KETUPI, KSPI. */
export function renderKsp(d) {
  $("#listMeta").textContent = `${d.ksp.length} proyek dipublikasikan`;
  renderCards($("#list"), d.ksp, kspCard, "Belum ada proyek yang dipublikasikan.");
}

/** Katalog proyek KPBU. */
export function renderKpbu(d) {
  $("#listMeta").textContent = `${d.kpbu.length} proyek KPBU`;
  renderCards($("#list"), d.kpbu, kpbuCard, "Belum ada proyek KPBU.");
}
