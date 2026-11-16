import { KPBU_TAHAP } from "../data/api.js";
import { $ } from "../lib/dom.js";
import { esc, nf, rupiah } from "../lib/format.js";
import { action, chip, meta, tanya } from "../ui/cards.js";
import { icon } from "../ui/icons.js";
import { asetCard, kpbuCard, kspCard, objekCard, sewaCard, SEWA_TONE, tahapBar } from "../ui/item-cards.js";
import { createMap, markerEl } from "../ui/map.js";

/* Halaman detail satu item (aset, objek, sewa, KSP, KPBU): ringkasan, rincian, lokasi, dan data terkait. */

const MENU = {
  aset: ["Aset terminal", "/aset/", "profil"],
  objek: ["Objek komersial", "/objek/", "objek"],
  sewa: ["Nilai sewa", "/sewa/", "sewa"],
  ksp: ["Proyek KSP dsj.", "/ksp/", "ksp"],
  kpbu: ["Proyek KPBU", "/kpbu/", "kpbu"],
};

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
        place: r.bptd,
        chip: chip(r.status, r.status === "Operasional" ? "ok" : "grey"),
        rows: [
          ["Tipe", r.tipe],
          ["BPTD", r.bptd],
          ["Luas lahan", `${nf.format(r.luas)} m²`],
          ["Kondisi", r.kondisi],
          ["Status operasional", r.status],
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
        place: `${r.lokasi} · ${r.bptd}`,
        chip: chip(r.skema, "primary"),
        rows: [
          ["Klasifikasi", r.klasifikasi],
          ["Peruntukan", r.skema],
          ["Lokasi", r.lokasi],
          ["BPTD", r.bptd],
          ["Luas", `${nf.format(r.luas)} m²`],
          ["Kondisi", r.kondisi],
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
        place: objek ? `${objek.lokasi} · ${objek.bptd}` : "",
        chip: chip(r.status, SEWA_TONE[r.status] || "grey"),
        rows: [
          ["Objek sewa", r.objek],
          ["Nilai sewa", rupiah(r.nilai)],
          ["Jangka waktu", r.jangkaWaktu],
          ["Status pemanfaatan", r.status],
        ],
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
        place: r.aset,
        chip: chip(r.skema, "primary"),
        rows: [
          ["Skema", r.skema],
          ["Aset", r.aset],
          ["Pemrakarsa", r.pemrakarsa],
          ["Tahun kajian", r.tahunKajian],
          ["Jangka waktu", r.jangkaWaktu],
        ],
        note: "Proyeksi keuangan (nilai investasi, NPV, IRR) tidak dipublikasikan.",
        ask: tanya(`Proyek ${r.nama}`),
        related: [["Berada di aset", "aset", aset ? [aset] : []]],
      };
    case "kpbu": {
      const n = KPBU_TAHAP.indexOf(r.tahap) + 1;
      return {
        aset,
        icon: "flag",
        kicker: `${r.id} · ${r.skema}`,
        title: r.nama,
        place: r.aset,
        chip: chip(r.aktif ? "Aktif" : "Tidak aktif", r.aktif ? "ok" : "grey"),
        rows: [
          ["ID proyek", r.id],
          ["Skema", r.skema],
          ["Aset", r.aset],
          ["Tahap", `${r.tahap} (${n}/${KPBU_TAHAP.length})`],
          ["Nilai investasi", rupiah(r.investasi)],
          ["Status", r.aktif ? "Aktif" : "Tidak aktif"],
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
  const item = d[key].find((r) => r.id === id);
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
    ${related}`;

  // Peta kecil lokasi aset (untuk objek/sewa/proyek: lokasi aset tempatnya berada).
  if (x.aset?.lat != null) {
    createMap("detailMap", { center: [x.aset.lng, x.aset.lat], zoom: 10 }).then((res) => {
      if (!res) return;
      new res.lib.Marker({ element: markerEl(x.aset.nama) }).setLngLat([x.aset.lng, x.aset.lat]).addTo(res.map);
    });
  } else {
    $("#detailMap").innerHTML = '<p class="grid h-full min-h-40 place-items-center px-6 text-center text-sm text-muted-foreground">Lokasi belum tersedia.</p>';
  }
}
