"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Posisi } from "@/lib/types";

interface TambahPosisiModalProps {
  posisi?: Posisi;
  onClose: () => void;
  onSaved: (posisi: Posisi) => void;
}

export function TambahPosisiModal({ posisi, onClose, onSaved }: TambahPosisiModalProps) {
  const isEdit = Boolean(posisi);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState(posisi?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(posisi?.deskripsi ?? "");
  const [aktif, setAktif] = useState(posisi?.aktif ?? true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nama,
        deskripsi: deskripsi || undefined,
        aktif,
        dapatDitugaskanServis: posisi?.dapatDitugaskanServis ?? true,
      };
      const saved = isEdit ? await api.updatePosisi(posisi!.id, payload) : await api.createPosisi(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan posisi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Posisi" : "Tambah Posisi"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <p className="text-sm text-zinc-500">
            {isEdit ? "Perbarui informasi posisi" : "Tambahkan posisi/jabatan baru untuk karyawan"}
          </p>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Nama Posisi <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Senior Mechanic"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Deskripsi</span>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi posisi..."
              rows={3}
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={aktif}
              onChange={(e) => setAktif(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
            />
            Aktif
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              {submitting ? "Menyimpan..." : isEdit ? "Perbarui" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";
