import { detailUrl, KPBU_TAHAP } from "../data/api.js";
import { kiosId, PETA_CONTOH } from "../data/peta-contoh.js";
import { $ } from "../lib/dom.js";
import { esc, nf, rupiah } from "../lib/format.js";
import { action, chip, meta, tanya } from "../ui/cards.js";
import { icon } from "../ui/icons.js";
import { asetCard, kpbuCard, kspCard, objekCard, sewaCard, SEWA_TONE, tahapBar } from "../ui/item-cards.js";
import { createMap, pinEl } from "../ui/map.js";

/* Halaman detail satu item (aset, objek, sewa, KSP, KPBU): ringkasan, rincian, lokasi, dan data terkait. */

const MENU = {
  aset: ["Aset BMN", "/aset/", "profil"],
  objek: ["Objek Komersial", "/objek/", "objek"],
  sewa: ["Nilai Sewa", "/sewa/", "sewa"],
  ksp: ["Proyek", "/ksp/", "ksp"],
  kpbu: ["KPBU", "/kpbu/", "kpbu"],
  kios: ["Peta", "/peta/", "kios"],
};

/** Kios dari titik contoh peta (src/data/peta-contoh.js), masing-masing membawa terminalnya. */
const KIOS = PETA_CONTOH.flatMap((t) => t.kios.map((k) => ({ ...k, id: kiosId(t, k), terminal: t })));
const KIOS_TONE = { Tersedia: "info", Tersewa: "ok", "Dalam proses": "warn" };

const CARD = { aset: asetCard, objek: objekCard, sewa: sewaCard, ksp: kspCard, kpbu: kpbuCard };

/** Rincian berlabel; nilai kosong → "Belum tersedia". */
const detailList = (rows) => `
  <dl class="detail-list">
    ${rows
      .map(
        ([k, v, raw]) => `<div><dt>${esc(k)}</dt><dd>${
          v == null || v === "" ? '<span class="text-muted-foreground">Belum tersedia</span>' : raw ? v : esc(v)
        }</dd></div>`,
      )
      .join("")}
  </dl>`;

/** Subbagian di dalam kartu utama (fasilitas, lalu lintas, pembiayaan, dsb.). */
const group = (title, body) => `
  <section class="mt-8">
    <h2 class="text-sm font-bold text-primary">${esc(title)}</h2>
    ${body}
  </section>`;

const m2 = (v) => (v == null ? null : `${nf.format(v)} m²`);

/** Fasilitas sebagai chip. */
const fasilitas = (list) =>
  `<ul class="mt-3 flex flex-wrap gap-2">${list.map((f) => `<li>${chip(f, "primary")}</li>`).join("")}</ul>`;

/** Lalu lintas terminal: 4 angka. */
const lalin = (l) => `
  <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
    ${[
      ["Bus berangkat", l.busBerangkat],
      ["Bus datang", l.busDatang],
      ["Penumpang berangkat", l.penumpangBerangkat],
      ["Penumpang datang", l.penumpangDatang],
    ]
      .map(
        ([k, v]) => `
      <div class="rounded-2xl bg-muted/60 p-3">
        <dt class="text-xs text-muted-foreground">${k}</dt>
        <dd class="mt-1 text-subheading font-semibold tabular-nums">${nf.format(v)}</dd>
      </div>`,
      )
      .join("")}
  </dl>`;

/** Isi khusus per jenis: kicker, judul, ikon, chip, rincian, aksi, dan daftar terkait. */
function describe(type, r, d) {
  const aset = d.profil.find((a) => a.id === (type === "aset" ? r.id : r.asetId)) || null;
  switch (type) {
    case "aset": {
      const rel = d.related(r.id);
      return {
        aset,
        icon: "building",
        kicker: r.tipe,
        title: r.nama,
        place: r.alamat || r.bptd,
        chip: chip(r.status, r.status === "Operasional" ? "ok" : "grey"),
        rows: [
          ["Tipe", r.tipe],
          ["Provinsi", r.provinsi],
          ["BPTD", r.bptd],
          ["Luas lahan", m2(r.luas)],
          ["Luas bangunan", m2(r.luasBangunan)],
          ["Jenis BMN", r.jenisBmn],
          ["Kondisi", r.kondisi],
          ["Status operasional", r.status],
          ["Rencana pengembangan", r.rencanaPengembangan],
        ],
        groups: [
          r.fasilitas?.length ? ["Fasilitas", fasilitas(r.fasilitas)] : null,
          r.lalin ? [`Lalu lintas terminal tahun ${r.lalin.tahun}`, lalin(r.lalin)] : null,
        ],
        ask: tanya(`Informasi aset ${r.nama}`),
        related: [
          ["Objek komersial di aset ini", "objek", rel.objek],
          ["Nilai sewa", "sewa", rel.sewa],
          ["Proyek KSP dsj.", "ksp", rel.ksp],
          ["Proyek KPBU", "kpbu", rel.kpbu],
        ],
      };
    }
    case "objek":
      return {
        aset,
        icon: "tag",
        kicker: r.klasifikasi,
        title: r.nama,
        place: `${r.aset} · ${r.provinsi}`,
        chip: chip(r.skema, "primary"),
        rows: [
          ["Klasifikasi", r.klasifikasi],
          ["Lokasi di terminal", r.lokasi],
          ["Skema pemanfaatan", r.skema],
          ["Luas", m2(r.luas)],
          ["Kondisi", r.kondisi],
          ["Jenis BMN", r.jenisBmn],
          ["BPTD", r.bptd],
          ["Kode barang", r.kodeBarang],
          ["NUP", r.nup],
        ],
        ask: tanya(`Pemanfaatan ${r.nama}`),
        related: [
          ["Nilai sewa objek ini", "sewa", d.sewa.filter((s) => s.objekId === r.id)],
          ["Berada di aset", "aset", aset ? [aset] : []],
        ],
      };
    case "sewa": {
      const objek = d.objek.find((o) => o.id === r.objekId);
      return {
        aset,
        icon: "wallet",
        kicker: "Nilai sewa",
        title: r.objek,
        place: objek ? `${objek.aset} · ${objek.provinsi}` : "",
        chip: chip(r.status, SEWA_TONE[r.status] || "grey"),
        rows: [
          [`Nilai sewa${r.periode ? ` (${r.periode.toLowerCase()})` : ""}`, rupiah(r.nilai)],
          ["Periode", r.periode],
          ["Jangka waktu", r.jangkaWaktu],
          ["Status pemanfaatan", r.status],
          ["Luas", m2(r.luas)],
        ],
        groups: objek
          ? [
              [
                "Objek yang disewakan",
                detailList([
                  ["Klasifikasi", objek.klasifikasi],
                  ["Lokasi di terminal", objek.lokasi],
                  ["Skema pemanfaatan", objek.skema],
                  ["Kondisi", objek.kondisi],
                  ["BPTD", objek.bptd],
                ]),
              ],
            ]
          : [],
        ask: tanya(`Minat sewa ${r.objek}`),
        askLabel: r.status === "Tersedia" ? "Ajukan minat sewa" : "Tanya objek ini",
        related: [
          ["Objek komersial", "objek", objek ? [objek] : []],
          ["Berada di aset", "aset", aset ? [aset] : []],
        ],
      };
    }
    case "ksp":
      return {
        aset,
        icon: "layers",
        kicker: r.skema,
        title: r.nama,
        place: `${r.aset} · ${r.provinsi}`,
        chip: chip(r.skema, "primary"),
        rows: [
          ["Skema kerja sama", r.skema],
          ["Aset", r.aset],
          ["BPTD", r.bptd],
          ["Pemrakarsa", r.pemrakarsa],
          ["Tahun kajian", r.tahunKajian],
          ["Jangka waktu", r.jangkaWaktu],
        ],
        note: "Proyeksi keuangan (nilai investasi, NPV, IRR) tidak dipublikasikan.",
        ask: tanya(`Proyek ${r.nama}`),
        related: [["Berada di aset", "aset", aset ? [aset] : []]],
      };
    case "kios": {
      const t = r.terminal;
      const others = t.kios.filter((k) => k.kode !== r.kode);
      return {
        aset: t,
        icon: "tag",
        kicker: r.klasifikasi,
        title: r.nama,
        place: `${t.nama} · ${t.provinsi}`,
        chip: chip(r.status, KIOS_TONE[r.status] || "grey"),
        rows: [
          ["Status", r.status],
          ["Klasifikasi", r.klasifikasi],
          ["Lokasi di terminal", r.lokasi],
          ["Terminal", t.nama],
          ["Tipe terminal", t.tipe],
          ["Provinsi", t.provinsi],
        ],
        ask: tanya(`Minat sewa ${r.nama} di ${t.nama}`),
        askLabel: r.status === "Tersedia" ? "Ajukan minat sewa" : "Tanya kios ini",
        related: [],
        relatedHtml: others.length
          ? `<section class="mt-10">
              <h2 class="mb-4 text-subheading font-semibold text-primary">Kios lain di ${esc(t.nama)}</h2>
              <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                ${others
                  .map(
                    (k) => `
                  <li><a class="item-card flex-row! items-center justify-between gap-3 p-4!" href="${detailUrl("kios", kiosId(t, k))}">
                    <span class="min-w-0">
                      <span class="block truncate font-semibold">${esc(k.nama)}</span>
                      <span class="block truncate text-xs text-muted-foreground">${esc(k.lokasi)}</span>
                    </span>
                    ${chip(k.status, KIOS_TONE[k.status] || "grey")}
                  </a></li>`,
                  )
                  .join("")}
              </ul>
            </section>`
          : "",
      };
    }
    case "kpbu": {
      const n = KPBU_TAHAP.indexOf(r.tahap) + 1;
      return {
        aset,
        icon: "flag",
        kicker: `${r.id} · ${r.skema}`,
        title: r.nama,
        place: `${r.aset} · ${r.provinsi}`,
        chip: chip(r.aktif ? "Aktif" : "Tidak aktif", r.aktif ? "ok" : "grey"),
        rows: [
          ["Nilai investasi", rupiah(r.investasi)],
          ["Masa konsesi", r.masaKonsesi],
          ["Skema", r.skema],
          ["Tahap", `${r.tahap} (${n}/${KPBU_TAHAP.length})`],
          ["Tahap spesifik", r.tahapSpesifik],
          ["Status PPP Book", r.statusPppBook],
          ["PJPK", r.pjpk],
          ["Sektor", r.sektor],
          ["Subsektor", r.subsektor],
          ["BPTD", r.bptd],
        ],
        groups: [
          [
            "Pembiayaan dan konsesi",
            detailList([
              ["Sumber pembiayaan", r.sumberPembiayaan],
              ["Skema pengembalian investasi", r.skemaPengembalian],
              ["Masa konstruksi", r.masaKonstruksi],
              ["Masa operasi", r.masaOperasi],
            ]),
          ],
          r.lingkup ? ["Lingkup KPBU", `<p class="mt-3">${esc(r.lingkup)}</p>`] : null,
        ],
        extra: tahapBar(r.tahap),
        ask: tanya(`Proyek KPBU ${r.id} ${r.nama}`),
        related: [["Berada di aset", "aset", aset ? [aset] : []]],
      };
    }
  }
}

export function renderDetail(d) {
  const type = $("main").dataset.type;
  const [menuLabel, menuHref, key] = MENU[type];
  const id = new URLSearchParams(location.search).get("id");
  const item = (key === "kios" ? KIOS : d[key]).find((r) => r.id === id);
  const root = $("#detail");

  $("#crumbMenu").textContent = menuLabel;
  $("#crumbMenu").href = menuHref;

  if (!item) {
    $("#crumbItem").textContent = "Tidak ditemukan";
    root.innerHTML = `
      <div class="rounded-[24px] bg-card px-6 py-16 text-center">
        <p class="text-subheading font-semibold">Data tidak ditemukan</p>
        <p class="mt-2 text-sm text-muted-foreground">Data mungkin sudah diperbarui atau tautannya salah.</p>
        <a class="btn btn-primary mt-6" href="${menuHref}">Lihat semua ${esc(menuLabel.toLowerCase())}</a>
      </div>`;
    return;
  }

  const x = describe(type, item, d);
  document.title = `${x.title} — ${menuLabel}`;
  $("#crumbItem").textContent = x.title;

  const maps = x.aset?.lat != null ? action(`https://www.google.com/maps?q=${x.aset.lat},${x.aset.lng}`, "Buka di Google Maps", { external: true }) : "";
  const related = x.related
    .filter(([, , rows]) => rows.length)
    .map(
      ([label, t, rows]) => `
      <section class="mt-10">
        <h2 class="mb-4 text-subheading font-semibold text-primary">${esc(label)}</h2>
        <div class="item-grid">${rows.map(CARD[t]).join("")}</div>
      </section>`,
    )
    .join("");

  root.innerHTML = `
    <div class="grid gap-4 lg:grid-cols-3">
      <section class="rounded-[24px] bg-card p-6 lg:col-span-2">
        <div class="flex items-start justify-between gap-4">
          <span class="icon-badge">${icon(x.icon)}</span>
          ${x.chip}
        </div>
        <p class="item-kicker">${esc(x.kicker)}</p>
        <h1 class="mt-1 text-heading-sm font-semibold text-primary sm:text-heading">${esc(x.title)}</h1>
        ${x.place ? meta("pin", x.place) : ""}
        ${x.extra || ""}
        ${detailList(x.rows)}
        ${(x.groups || []).filter(Boolean).map(([t, body]) => group(t, body)).join("")}
        ${x.note ? `<p class="mt-4 flex items-center gap-2 text-sm text-muted-foreground">${icon("lock", 15)} ${esc(x.note)}</p>` : ""}
        <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a class="btn btn-primary" href="${x.ask}">${esc(x.askLabel || "Ajukan pertanyaan")}</a>
          ${maps}
        </div>
      </section>
      <section class="overflow-hidden rounded-[24px] bg-card" aria-label="Lokasi">
        <div id="detailMap" class="h-72 w-full bg-muted lg:h-full lg:min-h-[320px]"></div>
      </section>
    </div>
    ${related}${x.relatedHtml || ""}`;

  // Peta kecil lokasi aset (untuk objek/sewa/proyek: lokasi aset tempatnya berada).
  if (x.aset?.lat != null) {
    createMap("detailMap", { center: [x.aset.lng, x.aset.lat], zoom: 10 }).then((res) => {
      if (!res) return;
      new res.lib.Marker({ element: pinEl(x.aset.nama), anchor: "bottom" }).setLngLat([x.aset.lng, x.aset.lat]).addTo(res.map);
    });
  } else {
    $("#detailMap").innerHTML = '<p class="grid h-full min-h-40 place-items-center px-6 text-center text-sm text-muted-foreground">Lokasi belum tersedia.</p>';
  }
}
