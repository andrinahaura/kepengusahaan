// Worker MapLibre v6 dicari relatif terhadap modulnya; setelah dibundel Vite path itu berubah,
// jadi URL worker diberikan eksplisit (Vite menyalinnya sebagai aset).
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/**
 * Buat peta MapLibre (dimuat terpisah agar bundel awal ringan).
 * Mengembalikan { map, lib } atau null bila gagal; saat gagal, kontainer diisi pesan.
 */
export async function createMap(container, options = {}) {
  try {
    const lib = await import("maplibre-gl");
    lib.setWorkerUrl(workerUrl);
    const map = new lib.Map({
      container,
      style: MAP_STYLE,
      center: [118, -2.5],
      zoom: 3.6,
      cooperativeGestures: true,
      locale: {
        "CooperativeGesturesHandler.WindowsHelpText": "Gunakan Ctrl + scroll untuk zoom peta",
        "CooperativeGesturesHandler.MacHelpText": "Gunakan ⌘ + scroll untuk zoom peta",
        "CooperativeGesturesHandler.MobileHelpText": "Gunakan dua jari untuk menggeser peta",
      },
      attributionControl: { compact: true },
      ...options,
    });
    map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
    return { map, lib };
  } catch {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    el.innerHTML = '<p class="grid h-full place-items-center text-sm text-muted-foreground">Peta tidak dapat dimuat.</p>';
    return null;
  }
}

/**
 * Pin terminal (gaya .map-pin): kepala bulat navy berikon gedung dengan ekor ke titik lokasi.
 * Pasang dengan Marker({ element, anchor: "bottom" }) supaya ujung ekor tepat di koordinat.
 * `badge` (angka) tampil sebagai lencana kecil di pojok kepala pin.
 */
export function pinEl(label, badge) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "map-pin";
  el.setAttribute("aria-label", label);
  el.innerHTML = `<span class="map-pin-head"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h4M18 9h2a2 2 0 0 1 2 2v11h-4M10 6h4M10 10h4M10 14h4M10 18h4"/></svg></span>${
    badge ? `<span class="map-pin-badge">${badge}</span>` : ""
  }`;
  return el;
}
