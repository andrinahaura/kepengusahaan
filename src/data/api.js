import { DATA } from "./public-data.js";

export const KPBU_TAHAP = ["Perencanaan", "Penyiapan", "Transaksi", "Konstruksi", "Operasi", "Serah Terima"];

/* Hanya rekaman terverifikasi yang tampil ke publik (sama dengan portal e-kepengusahaan).
   Rekaman tanpa kolom statusData (objek, sewa) mengikuti asetnya. */
const isPublic = (r) => r.statusData == null || r.statusData === "Terverifikasi";

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

  const profil = raw.profil.filter(isPublic).map((r) => ({ ...r, id: slug(r.nama), coord: r.lat != null ? { lat: r.lat, lng: r.lng } : null }));
  const asetByNama = new Map(profil.map((a) => [a.nama, a]));
  const asetByBptd = (bptd) => {
    const list = profil.filter((a) => a.bptd === bptd);
    return list.length === 1 ? list[0] : null; // hanya bila satu-satunya aset di BPTD itu
  };

  // Objek dihubungkan lewat nama aset; bila kosong, lewat BPTD (hanya bila satu-satunya aset di BPTD itu).
  const objek = raw.objekKomersial
    .map((r) => {
      const aset = asetByNama.get(r.aset) ?? asetByBptd(r.bptd);
      return { ...r, id: slug(`${r.kodeBarang}-${r.nup}`), asetId: aset?.id ?? null, provinsi: aset?.provinsi ?? null };
    })
    .filter((r) => r.asetId);
  const objekByNama = new Map(objek.map((o) => [o.nama, o]));
  const sewa = raw.nilaiSewa
    .map((r) => {
      const o = objekByNama.get(r.objek);
      return { ...r, id: slug(`${r.objek}-${r.jangkaWaktu}`), objekId: o?.id ?? null, asetId: o?.asetId ?? null, luas: o?.luas ?? null };
    })
    .filter((r) => r.objekId);
  const withAset = (r) => {
    const a = asetByNama.get(r.aset);
    return { asetId: a?.id ?? null, bptd: a?.bptd ?? null, provinsi: a?.provinsi ?? null };
  };
  const ksp = raw.proyekKsp.filter(isPublic).map((r) => ({ ...r, id: slug(r.nama), ...withAset(r) })).filter((r) => r.asetId);
  const kpbu = raw.kpbu.filter(isPublic).map((r) => ({ ...r, ...withAset(r) })).filter((r) => r.asetId);

  // Lokasi item lain = lokasi asetnya (untuk gambar pratinjau peta di kartu).
  const asetById = new Map(profil.map((a) => [a.id, a]));
  for (const r of [...objek, ...sewa, ...ksp, ...kpbu]) r.coord = asetById.get(r.asetId)?.coord ?? null;

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
