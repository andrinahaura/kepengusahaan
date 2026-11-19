import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const root = import.meta.dirname;
const partialsDir = resolve(root, "partials");

/** Halaman (multi-page). Tambah halaman baru: buat <slug>/index.html lalu daftarkan di sini. */
const PAGES = [
  "aset", "objek", "sewa", "ksp", "kpbu", "peta", "dokumen", "klinik",
  // Halaman detail: /<menu>/detail/?id=…
  "aset/detail", "objek/detail", "sewa/detail", "ksp/detail", "kpbu/detail", "kios/detail",
];

/**
 * Ganti `<!-- @include nama.html -->` dengan isi partials/nama.html,
 * supaya head, navbar, dan footer cukup ditulis sekali.
 */
function htmlPartials() {
  const include = (html) =>
    html.replace(/<!--\s*@include\s+([\w.-]+)\s*-->/g, (_, file) =>
      readFileSync(resolve(partialsDir, file), "utf8").trimEnd(),
    );
  return {
    name: "html-partials",
    transformIndexHtml: { order: "pre", handler: include },
    configureServer(server) {
      server.watcher.add(partialsDir);
      server.watcher.on("change", (file) => {
        if (file.startsWith(partialsDir)) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        ...Object.fromEntries(PAGES.map((p) => [p.replace("/", "-"), resolve(root, p, "index.html")])),
      },
    },
    // MapLibre (~1 MB) dimuat terpisah lewat dynamic import, jadi wajar melebihi batas default.
    chunkSizeWarningLimit: 1200,
  },
});
