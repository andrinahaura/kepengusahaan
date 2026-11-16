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

/** Elemen penanda bulat (gaya .map-marker). */
export function markerEl(label) {
  const el = document.createElement("button");
  el.className = "map-marker";
  el.setAttribute("aria-label", label);
  return el;
}
