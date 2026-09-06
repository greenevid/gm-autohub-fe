"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Info, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Karyawan, Posisi } from "@/lib/types";
import { EmptyState } from "@/components/ui/Panel";
import { Pagination, paginate } from "@/components/ui/Pagination";

export function PosisiServisPanel() {
  const [posisi, setPosisi] = useState<Posisi[] | null>(null);
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    api.posisi().then((data) => {
      setPosisi(data);
      setSelected(Object.fromEntries(data.map((p) => [p.id, p.dapatDitugaskanServis])));
    });
    api.karyawan().then(setKaryawan);
  }, []);

  const jumlahKaryawanByPosisi = useMemo(() => {
    const map = new Map<string, number>();
    karyawan.forEach((k) => {
      if (!k.posisiId) return;
      map.set(k.posisiId, (map.get(k.posisiId) ?? 0) + 1);
    });
    return map;
  }, [karyawan]);

  const filtered = useMemo(() => {
    if (!posisi) return null;
    const q = search.trim().toLowerCase();
    if (!q) return posisi;
    return posisi.filter((p) => p.nama.toLowerCase().includes(q));
  }, [posisi, search]);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const totalCount = posisi?.length ?? 0;
  const isDirty = posisi?.some((p) => Boolean(selected[p.id]) !== p.dapatDitugaskanServis) ?? false;

  async function handleSave() {
    if (!posisi) return;
    setSaving(true);
    try {
      const changed = posisi.filter((p) => Boolean(selected[p.id]) !== p.dapatDitugaskanServis);
      await Promise.all(
        changed.map((p) => api.updatePosisi(p.id, { dapatDitugaskanServis: Boolean(selected[p.id]) }))
      );
      const refreshed = await api.posisi();
      setPosisi(refreshed);
      setSelected(Object.fromEntries(refreshed.map((p) => [p.id, p.dapatDitugaskanServis])));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-zinc-900">Posisi untuk Servis</h2>
      <p className="text-sm text-zinc-500">Konfigurasi posisi yang dapat ditugaskan ke pengerjaan jasa</p>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-5">
        <div>
          <p className="text-base font-semibold text-zinc-900">Posisi yang Dapat Ditugaskan ke Servis</p>
          <p className="text-sm text-zinc-500">
            Pilih posisi yang dapat ditugaskan saat menambahkan jasa pada invoice penjualan
          </p>
        </div>
        <button
          type="button"
          disabled={!isDirty || saving}
          onClick={handleSave}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold">Informasi</span>
          <br />
          Posisi yang dicentang akan muncul sebagai pilihan saat menugaskan mekanik pada jasa di invoice penjualan.
          Hanya karyawan dengan posisi yang dipilih yang akan ditampilkan.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari posisi..."
            className="w-full max-w-sm rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <span className="text-sm text-zinc-500">
          {selectedCount} dari {totalCount} posisi dipilih
        </span>
      </div>

      <div className="mt-4">
        {!filtered ? (
          <p className="text-sm text-zinc-400">Memuat…</p>
        ) : filtered.length === 0 ? (
          <EmptyState label="Belum ada data posisi" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="w-10 py-2 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((p) => selected[p.id])}
                      onChange={(e) =>
                        setSelected((prev) => ({
                          ...prev,
                          ...Object.fromEntries(filtered.map((p) => [p.id, e.target.checked])),
                        }))
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="py-2 pr-4 font-medium">Nama Posisi</th>
                  <th className="py-2 pr-4 font-medium">Deskripsi</th>
                  <th className="py-2 pr-4 font-medium">Jumlah Karyawan</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginate(filtered, page, pageSize).map((p) => (
                  <tr key={p.id} className="border-b border-zinc-50 last:border-0">
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={Boolean(selected[p.id])}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                        className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="py-3 pr-4 font-medium text-zinc-900">{p.nama}</td>
                    <td className="py-3 pr-4 text-zinc-500">{p.deskripsi || "-"}</td>
                    <td className="py-3 pr-4 text-zinc-500">{jumlahKaryawanByPosisi.get(p.id) ?? 0}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          p.aktif ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        {p.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
