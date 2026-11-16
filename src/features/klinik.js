import { $ } from "../lib/dom.js";

const MAX_FILE = 5 * 1024 * 1024;

const CHECKS = [
  ["fNama", (el) => el.value.trim().length > 0],
  ["fEmail", (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())],
  ["fSubjek", (el) => el.value.trim().length > 0],
  ["fPesan", (el) => el.value.trim().length >= 10],
  ["fFile", (el) => !el.files[0] || el.files[0].size <= MAX_FILE],
];

/** Form tiket Klinik Hub. */
export function initKlinik() {
  const form = $("#ticketForm");

  // Isi otomatis dari tautan "Tanya …" di halaman katalog: /klinik/?kategori=…&subjek=…
  const params = new URLSearchParams(location.search);
  const kat = params.get("kategori");
  if (kat && [...$("#fKategori").options].some((o) => o.value === kat)) $("#fKategori").value = kat;
  if (params.get("subjek")) $("#fSubjek").value = params.get("subjek").slice(0, 200);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    for (const [id, ok] of CHECKS) {
      const el = document.getElementById(id);
      const good = ok(el);
      el.closest(".field").classList.toggle("invalid", !good);
      if (!good && !firstBad) firstBad = el;
    }
    if (firstBad) return firstBad.focus();

    // TODO: kirim ke endpoint publik Klinik Hub (POST multipart) dan pakai nomor tiket dari respons.
    const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    $("#ticketNo").textContent = `TKT-${stamp}-${Math.floor(Math.random() * 9000) + 1000}`;
    $("#formFields").classList.add("hidden");
    $("#formSuccess").classList.remove("hidden");
  });

  form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("invalid"));

  $("#newTicket").addEventListener("click", () => {
    form.reset();
    $("#formSuccess").classList.add("hidden");
    $("#formFields").classList.remove("hidden");
    $("#fNama").focus();
  });
}
