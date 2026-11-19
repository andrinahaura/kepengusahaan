import { esc } from "../lib/format.js";
import { icon } from "./icons.js";

/* Gambar pratinjau di atas kartu.
   Pakai foto asli bila data punya `foto`; kalau belum, tampilkan potongan peta lokasi aset
   (gaya peta yang sama dengan beranda). Tanpa koordinat: latar polos + ikon. */

/** Bingkai peta lokasi: gambar diisi belakangan oleh hydrateMapThumbs() (src/ui/map-thumbs.js). */
const mapThumb = ({ lat, lng }) => `
  <img data-map-thumb="${lat},${lng}" alt="" class="size-full object-cover opacity-0 transition-opacity duration-300">
  <span class="map-marker pointer-events-none absolute top-1/2 left-1/2 -translate-1/2" aria-hidden="true"></span>`;

/**
 * Bingkai gambar kartu.
 * @param {{foto?: string, coord?: {lat:number,lng:number}|null, alt?: string, fallbackIcon?: string}} src
 * @param {string} badge  HTML chip yang ditumpuk di pojok kanan atas.
 */
export function media({ foto, coord, alt = "", fallbackIcon = "building" }, badge = "") {
  let inner;
  if (foto) inner = `<img src="${esc(foto)}" alt="${esc(alt)}" loading="lazy" decoding="async" class="size-full object-cover">`;
  else if (coord) inner = mapThumb(coord);
  else inner = `<span class="grid size-full place-items-center text-primary/40">${icon(fallbackIcon, 28)}</span>`;
  // Tanpa gambar: bingkai lebih pendek supaya tidak jadi kotak kosong yang besar.
  return `<div class="item-media ${foto || coord ? "" : "h-24!"}">${inner}${badge ? `<span class="absolute top-3 right-3">${badge}</span>` : ""}</div>`;
}
