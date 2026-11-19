import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { MAP_STYLE } from "./map.js";

/* Isi gambar peta di kartu (img[data-map-thumb="lat,lng"]).
   Satu peta MapLibre tak terlihat dipakai bergantian untuk setiap lokasi, hasilnya disimpan sebagai gambar.
   Ubin raster CARTO kini butuh API key, jadi dipakai gaya vektor yang sama dengan peta beranda. */

const ZOOM = 12;
const W = 480;
const H = 200;
const CACHE = "map-thumb:";

const readCache = (key) => {
  try {
    return sessionStorage.getItem(CACHE + key);
  } catch {
    return null;
  }
};
const writeCache = (key, url) => {
  try {
    sessionStorage.setItem(CACHE + key, url);
  } catch {
    /* penyimpanan penuh atau diblokir: abaikan */
  }
};

const show = (img, url) => {
  img.addEventListener("load", () => img.classList.remove("opacity-0"), { once: true });
  img.src = url;
};

export async function hydrateMapThumbs(root = document) {
  const groups = new Map();
  for (const img of root.querySelectorAll("img[data-map-thumb]:not([src])")) {
    const key = img.dataset.mapThumb;
    const cached = readCache(key);
    if (cached) show(img, cached);
    else groups.set(key, [...(groups.get(key) || []), img]);
  }
  if (!groups.size) return;

  let map;
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;left:-10000px;top:0;width:${W}px;height:${H}px;pointer-events:none`;
  el.setAttribute("aria-hidden", "true");
  document.body.append(el);
  try {
    const lib = await import("maplibre-gl");
    lib.setWorkerUrl(workerUrl);
    const [lat0, lng0] = groups.keys().next().value.split(",").map(Number);
    map = new lib.Map({
      container: el,
      style: MAP_STYLE,
      center: [lng0, lat0],
      zoom: ZOOM,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    await map.once("load");
    for (const [key, imgs] of groups) {
      const [lat, lng] = key.split(",").map(Number);
      map.jumpTo({ center: [lng, lat], zoom: ZOOM });
      map.triggerRepaint();
      await map.once("idle");
      const url = map.getCanvas().toDataURL("image/webp", 0.85);
      writeCache(key, url);
      imgs.forEach((img) => show(img, url));
    }
  } catch (err) {
    console.warn("Pratinjau peta gagal dibuat:", err);
  } finally {
    map?.remove();
    el.remove();
  }
}
