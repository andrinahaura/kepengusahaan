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

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
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
