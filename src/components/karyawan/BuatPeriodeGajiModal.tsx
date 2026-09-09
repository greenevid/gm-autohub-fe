"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import {
  Karyawan,
  PeriodeGaji,
  PeriodeGajiRow,
  Posisi,
  SATUAN_GAJI_OPTIONS,
  TIPE_GAJI_FILTER_OPTIONS,
  TipeGajiFilter,
} from "@/lib/types";
import { formatDateFull, formatNumberId, formatRupiah, parseNumberId } from "@/lib/format";
import { DateInput } from "@/components/ui/DateInput";

interface BuatPeriodeGajiModalProps {
  karyawanList: Karyawan[];
  posisiList: Posisi[];
  onClose: () => void;
  onSaved: (periode: PeriodeGaji) => void;
}

function satuanLabel(value: string) {
  return SATUAN_GAJI_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function BuatPeriodeGajiModal({ karyawanList, posisiList, onClose, onSaved }: BuatPeriodeGajiModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalSelesai, setTanggalSelesai] = useState(today);
  const [tipe, setTipe] = useState<TipeGajiFilter>("semua");
  const [namaManual, setNamaManual] = useState<string | null>(null);
  const [catatan, setCatatan] = useState("");
  const [rows, setRows] = useState<PeriodeGajiRow[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const namaPeriode =
    namaManual ?? `Periode ${formatDateFull(tanggalMulai)} – ${formatDateFull(tanggalSelesai)}`;

  function hitungUlang() {
    const posisiMap = new Map(posisiList.map((p) => [p.id, p.nama]));
    const cocok = karyawanList.filter(
      (k) => k.status === "aktif" && (tipe === "semua" || k.satuanGaji === tipe)
    );
    setRows(
      cocok.map((k) => ({
        karyawanId: k.id,
        namaKaryawan: k.nama,
        posisiNama: k.posisiId ? posisiMap.get(k.posisiId) : undefined,
        satuanGaji: k.satuanGaji,
        gajiPokok: k.gaji,
        komisi: 0,
        potongan: 0,
        totalTerima: k.gaji,
      }))
    );
  }

  function updateRow(index: number, patch: Partial<Pick<PeriodeGajiRow, "komisi" | "potongan">>) {
    setRows((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const row = { ...next[index], ...patch };
      row.totalTerima = row.gajiPokok + row.komisi - row.potongan;
      next[index] = row;
      return next;
    });
  }

  const totals = useMemo(() => {
    const list = rows ?? [];
    const totalGaji = list.reduce((s, r) => s + r.gajiPokok, 0);
    const totalKomisi = list.reduce((s, r) => s + r.komisi, 0);
    const totalPotongan = list.reduce((s, r) => s + r.potongan, 0);
    return { totalGaji, totalKomisi, totalPotongan, totalKeseluruhan: totalGaji + totalKomisi - totalPotongan };
  }, [rows]);

  async function handleSimpan() {
    if (!rows || rows.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const saved = await api.createPeriodeGaji({
        nama: namaPeriode,
        catatan: catatan || undefined,
        tanggalMulai,
        tanggalSelesai,
        tipe,
        rows,
        totalGaji: totals.totalGaji,
        totalKomisi: totals.totalKomisi,
        totalPotongan: totals.totalPotongan,
        totalKeseluruhan: totals.totalKeseluruhan,
      });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan periode gaji");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="bg-green-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rekap Gaji Karyawan</h2>
            <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-green-100">Buat dan simpan periode penggajian baru</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nama Periode</span>
              <input
                value={namaPeriode}
                onChange={(e) => setNamaManual(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Catatan</span>
              <input
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tambahan (opsional)"
                className={inputClass}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Rentang Tanggal</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DateInput
                value={tanggalMulai}
                onChange={(v) => {
                  setTanggalMulai(v);
                  setRows(null);
                }}
              />
              <DateInput
                value={tanggalSelesai}
                onChange={(v) => {
                  setTanggalSelesai(v);
                  setRows(null);
                }}
              />
            </div>
          </label>

          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Tipe Gaji Karyawan <span className="text-red-500">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {TIPE_GAJI_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTipe(opt.value);
                    setRows(null);
                  }}
                  className={clsx(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    tipe === opt.value
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={hitungUlang}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Hitung Ulang
            </button>
            <button
              type="button"
              disabled={!rows || rows.length === 0 || submitting}
              onClick={handleSimpan}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              {submitting ? "Menyimpan..." : "Simpan Periode Gaji"}
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-zinc-800 p-5 text-white">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total Keseluruhan</p>
              <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-zinc-900">PREVIEW MODE</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatRupiah(totals.totalKeseluruhan)}</p>
            <div className="mt-3 flex gap-8 text-sm">
              <div>
                <p className="text-zinc-400">Total Gaji</p>
                <p className="font-semibold">{formatRupiah(totals.totalGaji)}</p>
              </div>
              <div>
                <p className="text-zinc-400">Komisi</p>
                <p className="font-semibold">{formatRupiah(totals.totalKomisi)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-green-600 text-xs uppercase tracking-wide text-white">
                  <th className="py-2 pl-4 pr-4 font-semibold">Karyawan</th>
                  <th className="py-2 pr-4 text-right font-semibold">Gaji Pokok (Rp)</th>
                  <th className="py-2 pr-4 text-right font-semibold">Komisi (Rp)</th>
                  <th className="py-2 pr-4 text-right font-semibold">Potongan (Rp)</th>
                  <th className="py-2 pr-4 text-right font-semibold">Total Terima (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {!rows ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-zinc-400">
                      Klik &quot;Hitung Ulang&quot; untuk memuat data karyawan
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-zinc-400">
                      Tidak ada karyawan aktif untuk tipe ini
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.karyawanId} className="border-b border-zinc-100 last:border-0">
                      <td className="py-3 pl-4 pr-4">
                        <p className="font-medium text-zinc-900">{row.namaKaryawan}</p>
                        <div className="mt-1 flex gap-1">
                          {row.posisiNama && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                              {row.posisiNama}
                            </span>
                          )}
                          <span className="rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-500">
                            {satuanLabel(row.satuanGaji)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-700">{row.gajiPokok.toLocaleString("id-ID")}</td>
                      <td className="py-3 pr-4 text-right">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberId(row.komisi)}
                          onChange={(e) => updateRow(index, { komisi: parseNumberId(e.target.value) })}
                          className="w-24 rounded border border-zinc-200 px-2 py-1 text-right text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberId(row.potongan)}
                          onChange={(e) => updateRow(index, { potongan: parseNumberId(e.target.value) })}
                          className="w-24 rounded border border-zinc-200 px-2 py-1 text-right text-sm"
                        />
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-blue-600">
                        {row.totalTerima.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-700 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";
