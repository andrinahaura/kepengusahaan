import { DATA } from "./public-data.js";

export const KPBU_TAHAP = ["Perencanaan", "Penyiapan", "Transaksi", "Konstruksi", "Operasi", "Serah Terima"];

/* Rekaman berstatus Draf tidak tampil ke publik. */
const isPublic = (r) => r.statusData !== "Draf";

/** "TERMINAL AMPLAS" → "terminal-amplas" (dipakai sebagai id di URL detail). */
const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** URL halaman detail: /<jenis>/detail/?id=… */
export const detailUrl = (type, id) => `/${type}/detail/?id=${encodeURIComponent(id)}`;

/**
 * Ambil data publik dan siapkan untuk tampilan: beri id stabil dan hubungkan setiap item ke asetnya.
 * TODO: ganti `DATA` dengan fetch ke endpoint publik backend, mis.
 *   const raw = await fetch("/api/publik").then((r) => r.json());
 *   Idealnya backend sudah mengirim id dan id aset untuk setiap objek, sewa, dan proyek.
 */
export async function loadPublicData() {
  const raw = DATA;

  const profil = raw.profil.map((r) => ({ ...r, id: slug(r.nama) }));
  const asetByNama = new Map(profil.map((a) => [a.nama, a]));
  const asetByBptd = (bptd) => {
    const list = profil.filter((a) => a.bptd === bptd);
    return list.length === 1 ? list[0] : null; // hanya bila satu-satunya aset di BPTD itu
  };

  // Objek komersial belum punya kolom aset di data; sementara dihubungkan lewat BPTD.
  const objek = raw.objekKomersial.map((r) => ({ ...r, id: slug(`${r.kodeBarang}-${r.nup}`), asetId: asetByBptd(r.bptd)?.id ?? null }));
  const objekByNama = new Map(objek.map((o) => [o.nama, o]));
  const sewa = raw.nilaiSewa.map((r) => ({
    ...r,
    id: slug(`${r.objek}-${r.jangkaWaktu}`),
    objekId: objekByNama.get(r.objek)?.id ?? null,
    asetId: objekByNama.get(r.objek)?.asetId ?? null,
  }));
  const ksp = raw.proyekKsp.filter(isPublic).map((r) => ({ ...r, id: slug(r.nama), asetId: asetByNama.get(r.aset)?.id ?? null }));
  const kpbu = raw.kpbu.filter(isPublic).map((r) => ({ ...r, asetId: asetByNama.get(r.aset)?.id ?? null }));

  /** Semua item yang terhubung ke satu aset. */
  const related = (asetId) => ({
    objek: objek.filter((r) => r.asetId === asetId),
    sewa: sewa.filter((r) => r.asetId === asetId),
    ksp: ksp.filter((r) => r.asetId === asetId),
    kpbu: kpbu.filter((r) => r.asetId === asetId),
  });

  return {
    updatedAt: raw.updatedAt,
    profil,
    objek,
    sewa,
    ksp,
    kpbu,
    related,
    kategori: raw.knowledgeBase.kategori,
    dokumen: raw.knowledgeBase.dokumen,
    totals: {
      luasLahan: profil.reduce((s, r) => s + (r.luas || 0), 0),
      investasi: kpbu.reduce((s, r) => s + r.investasi, 0),
      tersedia: sewa.filter((r) => r.status === "Tersedia").length,
      bptd: [...new Set(profil.map((r) => r.bptd))],
    },
  };
}
