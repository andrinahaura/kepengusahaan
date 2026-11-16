const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

export const nf = new Intl.NumberFormat("id-ID");
export const rupiah = (n) => "Rp " + nf.format(n);

export function rupiahShort(n) {
  const f = (v, s) => "Rp " + v.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " " + s;
  if (n >= 1e12) return f(n / 1e12, "T");
  if (n >= 1e9) return f(n / 1e9, "M");
  if (n >= 1e6) return f(n / 1e6, "jt");
  return rupiah(n);
}

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
