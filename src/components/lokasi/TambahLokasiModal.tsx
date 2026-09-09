"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Lokasi, TIPE_LOKASI_OPTIONS, TipeLokasi } from "@/lib/types";
import { Select } from "@/components/ui/Select";

interface TambahLokasiModalProps {
  lokasi?: Lokasi;
  onClose: () => void;
  onSaved: (lokasi: Lokasi) => void;
}

export function TambahLokasiModal({ lokasi, onClose, onSaved }: TambahLokasiModalProps) {
  const isEdit = Boolean(lokasi);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState(lokasi?.nama ?? "");
  const [tipe, setTipe] = useState<TipeLokasi>(lokasi?.tipe ?? "toko");
  const [alamat, setAlamat] = useState(lokasi?.alamat ?? "");
  const [kota, setKota] = useState(lokasi?.kota ?? "");
  const [telepon, setTelepon] = useState(lokasi?.telepon ?? "");
  const [aktif, setAktif] = useState(lokasi ? lokasi.status === "aktif" : true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nama,
        tipe,
        alamat,
        kota,
        telepon,
        status: aktif ? ("aktif" as const) : ("nonaktif" as const),
      };
      const saved = isEdit ? await api.updateLokasi(lokasi!.id, payload) : await api.createLokasi(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan lokasi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Nama Lokasi <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Toko Pusat, Gudang A"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Tipe Lokasi <span className="text-red-500">*</span>
              </span>
              <Select
                value={tipe}
                onChange={(v) => setTipe(v as TipeLokasi)}
                options={TIPE_LOKASI_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Alamat Lengkap <span className="text-red-500">*</span>
            </span>
            <textarea
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Jl. Contoh No. 123"
              rows={2}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Kota <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                placeholder="Jakarta"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Nomor Telepon <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="021-12345678"
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={aktif}
              onChange={(e) => setAktif(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
            />
            Aktif
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Perbarui" : "Tambah Lokasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";
