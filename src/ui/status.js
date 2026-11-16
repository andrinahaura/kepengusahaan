import { esc } from "../lib/format.js";

/* Titik status kecil + teks. Hijau hanya untuk sinyal "berjalan". */
export const status = (text, color) =>
  `<span class="inline-flex items-center gap-1.5 whitespace-nowrap"><span class="size-1.5 rounded-full ${color}"></span>${esc(text)}</span>`;

export const statusOp = (s) => status(s, s === "Operasional" ? "bg-ok" : "bg-grey");
