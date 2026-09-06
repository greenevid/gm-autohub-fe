import { Kendaraan, Mekanik, PemasukanLain, Pelanggan, PengeluaranLain, Servis, StatusServis } from "./types";
import { isToday, servisTotal } from "./format";

export interface DashboardData {
  pelanggan: Pelanggan[];
  kendaraan: Kendaraan[];
  mekanik: Mekanik[];
  servis: Servis[];
  pemasukanLain: PemasukanLain[];
  pengeluaranLain: PengeluaranLain[];
}

export function kendaraanLabel(kendaraan: Kendaraan | undefined) {
  if (!kendaraan) return "Kendaraan tidak diketahui";
  return `${kendaraan.platNomor} • ${kendaraan.merk} ${kendaraan.model}`;
}

export function computeKpis(data: DashboardData) {
  const servisHariIni = data.servis.filter((s) => isToday(s.createdAt));
  const pendapatanServisHariIni = data.servis
    .filter((s) => s.status === "selesai" && isToday(s.updatedAt))
    .reduce((sum, s) => sum + servisTotal(s.items), 0);
  const pendapatanLainHariIni = data.pemasukanLain
    .filter((p) => p.status === "selesai" && isToday(p.tanggal))
    .reduce((sum, p) => sum + p.jumlah, 0);
  const pendapatanHariIni = pendapatanServisHariIni + pendapatanLainHariIni;
  const pengeluaranLainHariIni = data.pengeluaranLain
    .filter((p) => p.status === "selesai" && isToday(p.tanggal))
    .reduce((sum, p) => sum + p.jumlah, 0);
  const labaHariIni = pendapatanHariIni - pengeluaranLainHariIni;
  const servisAktif = data.servis.filter((s) =>
    ["antrian", "dikerjakan", "menunggu_sparepart"].includes(s.status)
  );

  return {
    pendapatanHariIni,
    pengeluaranLainHariIni,
    labaHariIni,
    servisMasukHariIni: servisHariIni.length,
    servisAktif: servisAktif.length,
  };
}

export function computeMonthlyServis(servis: Servis[], monthsBack = 5) {
  const now = new Date();
  const buckets: { key: string; label: string; total: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
      total: 0,
    });
  }

  for (const s of servis) {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.total += 1;
  }

  return buckets;
}

export function groupServisByStatus(servis: Servis[], status: StatusServis) {
  return servis
    .filter((s) => s.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function topKendaraanByServis(data: DashboardData, limit = 5) {
  const counts = new Map<string, number>();
  for (const s of data.servis) {
    counts.set(s.kendaraanId, (counts.get(s.kendaraanId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([kendaraanId, count]) => ({
      kendaraan: data.kendaraan.find((k) => k.id === kendaraanId),
      count,
    }));
}

export function topMekanik(data: DashboardData, limit = 5) {
  const stats = new Map<string, { count: number; revenue: number }>();
  for (const s of data.servis) {
    if (!s.mekanikId) continue;
    const current = stats.get(s.mekanikId) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += servisTotal(s.items);
    stats.set(s.mekanikId, current);
  }
  return [...stats.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([mekanikId, stat]) => ({
      mekanik: data.mekanik.find((m) => m.id === mekanikId),
      ...stat,
    }));
}

export function topPelanggan(data: DashboardData, limit = 5) {
  const kendaraanToPelanggan = new Map(data.kendaraan.map((k) => [k.id, k.pelangganId]));
  const stats = new Map<string, { count: number; revenue: number }>();

  for (const s of data.servis) {
    const pelangganId = kendaraanToPelanggan.get(s.kendaraanId);
    if (!pelangganId) continue;
    const current = stats.get(pelangganId) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += servisTotal(s.items);
    stats.set(pelangganId, current);
  }

  return [...stats.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([pelangganId, stat]) => ({
      pelanggan: data.pelanggan.find((p) => p.id === pelangganId),
      ...stat,
    }));
}

export function recentServis(servis: Servis[], limit = 5) {
  return [...servis]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
