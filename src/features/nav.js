import { $, $$ } from "../lib/dom.js";

/** Navbar mengambang: menu mobile + sembunyi saat scroll turun, muncul saat scroll naik. */
export function initNav() {
  const nav = $("#nav");
  const toggle = $("#menuToggle");

  // Tandai menu halaman aktif.
  const here = location.pathname.replace(/index\.html$/, "");
  $$("#navLinks a, [data-nav-cta]").forEach((a) => {
    const path = new URL(a.href).pathname;
    // Halaman detail (/aset/detail/) tetap menandai menu induknya (/aset/).
    if (path === here || (path !== "/" && here.startsWith(path))) a.setAttribute("aria-current", "page");
  });

  // Dropdown: buka/tutup lewat tombol, tutup saat klik di luar atau tekan Escape.
  const drops = $$("[data-drop]");
  const setDrop = (drop, open) => {
    drop.classList.toggle("open", open);
    drop.querySelector("[data-drop-toggle]").setAttribute("aria-expanded", String(open));
  };
  drops.forEach((drop) => {
    const btn = drop.querySelector("[data-drop-toggle]");
    // Menu induk ikut ditandai bila halaman aktif ada di dalam dropdown.
    if (drop.querySelector("[aria-current]")) btn.dataset.active = "";
    btn.addEventListener("click", () => {
      const open = !drop.classList.contains("open");
      drops.forEach((d) => setDrop(d, false));
      setDrop(drop, open);
    });
  });
  document.addEventListener("click", (e) => !nav.contains(e.target) && drops.forEach((d) => setDrop(d, false)));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = drops.find((d) => d.classList.contains("open"));
    if (!open) return;
    setDrop(open, false);
    open.querySelector("[data-drop-toggle]").focus();
  });

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    // Di mobile, dropdown yang memuat halaman aktif langsung terbuka.
    drops.forEach((d) => setDrop(d, open && d.querySelector("[aria-current]") != null));
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

  let lastY = scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const hide = y > lastY && y > 120 && !nav.classList.contains("open") && !nav.contains(document.activeElement);
    nav.style.transform = hide ? "translateY(calc(-100% - 12px))" : "";
    lastY = y;
    ticking = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!ticking) requestAnimationFrame(onScroll);
      ticking = true;
    },
    { passive: true },
  );
}
