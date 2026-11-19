import { detailUrl, KPBU_TAHAP } from "../data/api.js";
import { $ } from "../lib/dom.js";
import { esc, fmtDate, nf, rupiah, rupiahShort } from "../lib/format.js";
import { icon } from "../ui/icons.js";

/* Section-section di bawah peta beranda (latar putih & abu muda selang-seling, lihat index.html):
   Panduan mencari kios → Peluang usaha (tarif, objek, aset) → Proyek kerja sama (KPBU, KSP)
   → Knowledge Base → Klinik Hub. Semua angka & nama dari data publik (tanpa titik contoh peta). */

const STATUS_DOT = { Tersedia: "bg-info", Tersewa: "bg-ok", "Dalam proses": "bg-warn", Operasional: "bg-ok" };
const dot = (s) => `<span class="size-1.5 shrink-0 rounded-full ${STATUS_DOT[s] || "bg-grey"}"></span>`;

/** Kepala kartu: ikon + label di kiri, tombol panah ke halaman menu di kanan. */
const head = (ic, label, href, linkLabel) => `
  <div class="tile-head">
    <p class="tile-label"><span class="tile-icon">${icon(ic, 18)}</span>${esc(label)}</p>
    ${href ? `<a class="tile-go" href="${href}" aria-label="${esc(linkLabel)}">${icon("arrow", 16)}</a>` : ""}
  </div>`;

const empty = (text) => `<p class="tile-note mt-6">${esc(text)}</p>`;

/** Kartu besar: tiga langkah mencari kios + miniatur kartu kios di peta (data asli). */
function guide(d) {
  const t = d.profil.find((a) => d.related(a.id).objek.length);
  const kios = t ? d.related(t.id).objek : [];
  const sewaOf = (k) => d.sewa.find((s) => s.objekId === k.id);
  const steps = [
    ["pin", "Pilih terminal di peta", "Terminal dikelompokkan per provinsi di menu Peta."],
    ["tag", "Cek kios dan statusnya", "Klik pin untuk melihat daftar kios: tersedia, tersewa, atau dalam proses."],
    ["users", "Ajukan minat sewa", "Kirim pertanyaan atau minat lewat Klinik Hub."],
  ];
  const demo = t
    ? `
      <div class="guide-demo" aria-hidden="true">
        <div class="guide-card">
          <p class="text-[11px] text-muted-foreground">${esc([t.tipe, t.provinsi].filter(Boolean).join(" · "))}</p>
          <p class="mt-0.5 text-sm font-bold text-foreground">${esc(t.nama)}</p>
          <span class="pop-count mt-2.5 text-[11px]">${kios.length} kios</span>
          <ul class="mt-3 grid grid-cols-1 gap-1.5">
            ${kios
              .slice(0, 2)
              .map((k) => {
                const st = sewaOf(k)?.status ?? "Belum ada tarif";
                return `<li class="flex items-center justify-between gap-3 rounded-[12px] bg-muted/70 px-3 py-2">
                  <span class="min-w-0 truncate text-xs font-semibold">${esc(k.nama)}</span>
                  <span class="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">${dot(st)}${esc(st)}</span>
                </li>`;
              })
              .join("")}
          </ul>
        </div>
        <span class="map-pin relative pointer-events-none mx-auto mt-3"><span class="map-pin-head">${icon("building", 16)}</span><span class="map-pin-badge">${kios.length}</span></span>
      </div>`
    : "";

  return `
    <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <ol class="grid gap-3">
          ${steps
            .map(
              ([ic, title, text], i) => `
            <li class="guide-step">
              <span class="guide-num">${i + 1}</span>
              <span class="min-w-0">
                <span class="block font-semibold text-foreground">${title}</span>
                <span class="mt-0.5 block text-sm text-muted-foreground">${text}</span>
              </span>
              <span class="ml-auto hidden text-muted-foreground sm:block">${icon(ic, 20)}</span>
            </li>`,
            )
            .join("")}
        </ol>
        <div class="mt-8 flex flex-wrap gap-2">
          <a class="cta-pill" href="/peta/">Buka peta ${icon("arrow", 16)}</a>
          <a class="tile-ghost" href="/klinik/">Klinik Hub</a>
        </div>
      </div>
      ${demo}
    </div>`;
}

function tarif(d) {
  const min = d.sewa.reduce((m, s) => (m == null || s.nilai < m.nilai ? s : m), null);
  const tersedia = d.sewa.filter((s) => s.status === "Tersedia").length;
  return `
    <article class="tile">
      ${head("wallet", "Tarif sewa", "/sewa/", "Lihat semua nilai sewa")}
      ${
        min
          ? `<p class="tile-kicker">Mulai dari</p>
             <p class="tile-value">${esc(rupiah(min.nilai))}<span class="tile-unit">/ ${esc((min.periode || "periode").toLowerCase())}</span></p>
             <p class="tile-note mt-2"><span class="font-semibold text-foreground">${tersedia}</span> dari ${d.sewa.length} tarif masih tersedia</p>`
          : empty("Belum ada tarif sewa.")
      }
    </article>`;
}

function aset(d) {
  return `
    <article class="tile">
      ${head("building", `${d.profil.length} aset terminal`, "/aset/", "Lihat semua aset terminal")}
      ${
        d.profil.length
          ? `<ul class="mt-5 grid grid-cols-1 gap-1.5">
              ${d.profil
                .slice(0, 3)
                .map(
                  (a) => `
                <li><a class="tile-row" href="${detailUrl("aset", a.id)}">
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold">${esc(a.nama)}</span>
                    <span class="block truncate text-xs text-muted-foreground">${esc(a.provinsi)} · ${nf.format(a.luas)} m²</span>
                  </span>
                  ${dot(a.status)}
                </a></li>`,
                )
                .join("")}
            </ul>`
          : empty("Belum ada aset terminal.")
      }
    </article>`;
}

function objek(d) {
  const perJenis = new Map();
  d.objek.forEach((o) => perJenis.set(o.klasifikasi, (perJenis.get(o.klasifikasi) || 0) + 1));
  const luas = d.objek.reduce((s, o) => s + (o.luas || 0), 0);
  return `
    <article class="tile">
      ${head("tag", "Objek komersial", "/objek/", "Lihat semua objek komersial")}
      ${
        d.objek.length
          ? `<p class="tile-value">${nf.format(luas)}<span class="tile-unit">m²</span></p>
             <p class="tile-note mt-2">luas ruang komersial dari ${d.objek.length} objek</p>
             <div class="mt-5 flex flex-wrap gap-1.5">
               ${[...perJenis].map(([k, n]) => `<span class="tile-chip">${esc(k)} <b>${n}</b></span>`).join("")}
             </div>`
          : empty("Belum ada objek komersial.")
      }
    </article>`;
}

function kpbu(d) {
  const furthest = Math.max(0, ...d.kpbu.map((p) => KPBU_TAHAP.indexOf(p.tahap)));
  return `
    <article class="tile">
      ${head("chart", "KPBU", "/kpbu/", "Lihat semua proyek KPBU")}
      ${
        d.kpbu.length
          ? `<p class="tile-value">${esc(rupiahShort(d.totals.investasi))}</p>
             <p class="tile-note mt-2">nilai investasi dari ${d.kpbu.length} proyek</p>
             <div class="mt-5">
               <div class="flex gap-1" role="img" aria-label="Tahap terjauh: ${esc(KPBU_TAHAP[furthest])}, ${furthest + 1} dari ${KPBU_TAHAP.length}">
                 ${KPBU_TAHAP.map((_, i) => `<span class="h-1.5 flex-1 rounded-pill ${i <= furthest ? "bg-primary" : "bg-border"}"></span>`).join("")}
               </div>
               <p class="mt-2 text-xs text-muted-foreground">Tahap terjauh: <span class="font-semibold text-foreground">${esc(KPBU_TAHAP[furthest])}</span> (${furthest + 1}/${KPBU_TAHAP.length})</p>
             </div>`
          : empty("Belum ada proyek KPBU.")
      }
    </article>`;
}

function ksp(d) {
  return `
    <article class="tile">
      ${head("flag", "Proyek kerja sama", "/ksp/", "Lihat semua proyek kerja sama")}
      ${
        d.ksp.length
          ? `<ul class="mt-5 grid grid-cols-1 gap-1.5">
              ${d.ksp
                .slice(0, 3)
                .map(
                  (p) => `
                <li><a class="tile-row" href="${detailUrl("ksp", p.id)}">
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold">${esc(p.nama)}</span>
                    <span class="block truncate text-xs text-muted-foreground">${esc(p.aset)}</span>
                  </span>
                  <span class="tile-chip">${esc(p.skema)}</span>
                </a></li>`,
                )
                .join("")}
            </ul>`
          : empty("Belum ada proyek kerja sama.")
      }
    </article>`;
}

function kb(d) {
  return d.dokumen.length
    ? `<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${d.dokumen
          .slice(0, 3)
          .map(
            (x) => `
          <li><a class="tile h-full gap-4 transition-colors hover:border-primary/30" href="${esc(x.url)}" download>
            <span class="flex items-center justify-between gap-3">
              <span class="tile-icon">${icon("file", 18)}</span>
              <span class="tile-chip">${esc(x.kategori)}</span>
            </span>
            <span class="line-clamp-2 font-semibold text-foreground">${esc(x.judul)}</span>
            <span class="mt-auto text-xs text-muted-foreground">${esc(x.tipe)} · ${esc(fmtDate(x.diunggah))}</span>
          </a></li>`,
          )
          .join("")}
      </ul>`
    : `<p class="tile tile-note">Belum ada dokumen.</p>`;
}

const klinik = () => `
  <div class="tile-navy">
    <div class="max-w-xl">
      <p class="tile-label text-primary-foreground"><span class="tile-icon bg-primary-foreground/10 text-primary-foreground">${icon("users", 18)}</span>Klinik Hub</p>
      <h2 id="klinikTitle" class="mt-6 text-heading-sm font-semibold">Ada pertanyaan soal sewa atau kerja sama?</h2>
      <p class="mt-2 text-primary-foreground/75">Tanyakan langsung, cukup isi formulir singkat.</p>
    </div>
    <a class="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-pill bg-card px-6 text-sm font-semibold text-primary transition-colors hover:bg-accent" href="/klinik/">Ajukan pertanyaan ${icon("arrow", 16)}</a>
  </div>`;

export function renderSekilas(d) {
  $("#secPanduan").innerHTML = guide(d);
  $("#secSewa").innerHTML = [tarif(d), objek(d), aset(d)].join("");
  $("#secProyek").innerHTML = [kpbu(d), ksp(d)].join("");
  $("#kbAll").innerHTML = `Lihat semua ${d.dokumen.length} dokumen ${icon("arrow", 15)}`;
  $("#secKb").innerHTML = kb(d);
  $("#secKlinik").innerHTML = klinik();
}
