"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Lookup, LookupTipe } from "@/lib/types";

interface TambahLookupModalProps {
  tipe: LookupTipe;
  label: string;
  item?: Lookup;
  showJatuhTempo?: boolean;
  onClose: () => void;
  onSaved: (item: Lookup) => void;
}

export function TambahLookupModal({
  tipe,
  label,
  item,
  showJatuhTempo,
  onClose,
  onSaved,
}: TambahLookupModalProps) {
  const isEdit = Boolean(item);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nama, setNama] = useState(item?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi ?? "");
  const [jatuhTempoHari, setJatuhTempoHari] = useState(
    item?.jatuhTempoHari !== undefined ? String(item.jatuhTempoHari) : ""
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nama,
        deskripsi: deskripsi || undefined,
        jatuhTempoHari: showJatuhTempo && jatuhTempoHari !== "" ? Number(jatuhTempoHari) : undefined,
      };
      const saved = isEdit
        ? await api.updateLookup(item!.id, payload)
        : await api.createLookup({ tipe, ...payload });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Gagal menyimpan ${label.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">
            {isEdit ? `Edit ${label}` : `Tambah ${label}`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              Nama {label} <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={`Masukkan nama ${label.toLowerCase()}`}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Deskripsi</span>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi (opsional)"
              rows={3}
              className={inputClass}
            />
          </label>

          {showJatuhTempo && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Jatuh Tempo (Hari)</span>
              <input
                type="number"
                min={0}
                value={jatuhTempoHari}
                onChange={(e) => setJatuhTempoHari(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";
