"use client";

import { FormEvent, ReactNode, useState } from "react";
import { FileText, X } from "lucide-react";
import { api } from "@/lib/api";
import { Jasa } from "@/lib/types";
import { LookupSearchSelectField } from "@/components/ui/LookupSearchSelectField";

interface TambahJasaModalProps {
  item?: Jasa;
  onClose: () => void;
  onCreated: (jasa: Jasa) => void;
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

function SectionBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export function TambahJasaModal({ item, onClose, onCreated }: TambahJasaModalProps) {
  const isEdit = Boolean(item);
  const [kode, setKode] = useState(item?.kode ?? "");
  const [nama, setNama] = useState(item?.nama ?? "");
  const [kategori, setKategori] = useState(item?.kategori ?? "");
  const [jenis, setJenis] = useState(item?.jenis ?? "");
  const [model, setModel] = useState(item?.model ?? "");
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi ?? "");
  const [tampilBooking, setTampilBooking] = useState(item?.tampilBooking ?? true);
  const [harga, setHarga] = useState(item ? String(item.harga) : "");
  const [komisi, setKomisi] = useState(item ? String(item.komisi) : "10");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        kode,
        nama,
        kategori,
        jenis,
        model: model || undefined,
        deskripsi: deskripsi || undefined,
        harga: Number(harga) || 0,
        komisi: Number(komisi) || 0,
        tampilBooking,
      };
      const saved = isEdit ? await api.updateJasa(item!.id, payload) : await api.createJasa(payload);
      onCreated(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jasa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Jasa" : "Tambah Jasa"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-zinc-200 px-6">
          <span className="inline-block border-b-2 border-green-600 px-1 py-3 text-sm font-medium text-green-600">
            Informasi Umum
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <SectionBox title="Informasi Dasar">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kode Service" required>
                  <input required value={kode} onChange={(e) => setKode(e.target.value)} placeholder="SVC001" className={inputClass} />
                </Field>
                <Field label="Nama Service" required>
                  <input required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama service" className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kategori" required>
                  <LookupSearchSelectField
                    tipe="kategori"
                    label="Kategori"
                    value={kategori}
                    onChange={setKategori}
                    placeholder="Cari kategori..."
                    required
                  />
                </Field>
                <Field label="Jenis" required>
                  <LookupSearchSelectField
                    tipe="jenis"
                    label="Jenis"
                    value={jenis}
                    onChange={setJenis}
                    placeholder="Cari jenis..."
                    required
                  />
                </Field>
              </div>

              <Field label="Model">
                <LookupSearchSelectField
                  tipe="model"
                  label="Model"
                  value={model}
                  onChange={setModel}
                  placeholder="Cari model..."
                />
              </Field>

              <Field label="Deskripsi">
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsi item (opsional)"
                  rows={3}
                  className={inputClass}
                />
              </Field>

              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={tampilBooking}
                  onChange={(e) => setTampilBooking(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                />
                Tampilkan di form booking pelanggan
              </label>
            </SectionBox>

            <SectionBox title="Harga Jasa">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Harga Jual" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      Rp
                    </span>
                    <input
                      required
                      type="number"
                      min={0}
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      placeholder="0"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>
                <Field label="Komisi">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      %
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={komisi}
                      onChange={(e) => setKomisi(e.target.value)}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>
              </div>
            </SectionBox>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
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
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {submitting ? "Menyimpan..." : isEdit ? "Perbarui Jasa" : "Simpan Jasa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
