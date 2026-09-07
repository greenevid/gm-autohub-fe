"use client";

import { FormEvent, useState } from "react";
import { X, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { StatusSupplier, Supplier, SYARAT_PEMBAYARAN_OPTIONS } from "@/lib/types";
import { LookupSearchSelectField } from "@/components/ui/LookupSearchSelectField";
import { Select } from "@/components/ui/Select";

interface TambahSupplierModalProps {
  supplier?: Supplier;
  onClose: () => void;
  onSaved: (supplier: Supplier) => void;
}

export function TambahSupplierModal({ supplier, onClose, onSaved }: TambahSupplierModalProps) {
  const isEdit = Boolean(supplier);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState(supplier?.nama ?? "");
  const [tipe, setTipe] = useState(supplier?.tipe ?? "");
  const [telepon, setTelepon] = useState(supplier?.telepon ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [npwp, setNpwp] = useState(supplier?.npwp ?? "");
  const [nik, setNik] = useState(supplier?.nik ?? "");

  const [kota, setKota] = useState(supplier?.kota ?? "");
  const [syaratPembayaran, setSyaratPembayaran] = useState(supplier?.syaratPembayaran ?? "");
  const [alamat, setAlamat] = useState(supplier?.alamat ?? "");
  const [alamatPengiriman, setAlamatPengiriman] = useState(supplier?.alamatPengiriman ?? "");
  const [alamatPenagihan, setAlamatPenagihan] = useState(supplier?.alamatPenagihan ?? "");

  const [namaPIC, setNamaPIC] = useState(supplier?.namaPIC ?? "");
  const [kontakPIC, setKontakPIC] = useState(supplier?.kontakPIC ?? "");
  const [status, setStatus] = useState<StatusSupplier>(supplier?.status ?? "aktif");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nama,
        tipe,
        telepon,
        email,
        npwp: npwp || undefined,
        nik: nik || undefined,
        kota,
        syaratPembayaran: syaratPembayaran || undefined,
        alamat,
        alamatPengiriman: alamatPengiriman || undefined,
        alamatPenagihan: alamatPenagihan || undefined,
        namaPIC: namaPIC || undefined,
        kontakPIC: kontakPIC || undefined,
        status,
      };
      const saved = isEdit ? await api.updateSupplier(supplier!.id, payload) : await api.createSupplier(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan supplier");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Supplier" : "Supplier Baru"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
              <p className="text-sm font-semibold text-zinc-700">Informasi Dasar</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama Supplier" required>
                  <input
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama supplier"
                    className={inputClass}
                  />
                </Field>
                <Field label="Tipe Supplier">
                  <LookupSearchSelectField
                    tipe="tipe-supplier"
                    label="Tipe Supplier"
                    value={tipe}
                    onChange={setTipe}
                    placeholder="Cari tipe supplier..."
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nomor Handphone">
                  <input
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="081234567890"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supplier@example.com"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="NPWP">
                  <input
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="12.345.678.9-000.000"
                    className={inputClass}
                  />
                </Field>
                <Field label="NIK">
                  <input
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="1234567890123456"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-100 pt-5">
              <p className="text-sm font-semibold text-zinc-700">Informasi Tambahan</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kota">
                  <input
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Jakarta"
                    className={inputClass}
                  />
                </Field>
                <Field label="Syarat Pembayaran">
                  <Select
                    value={syaratPembayaran}
                    onChange={setSyaratPembayaran}
                    options={[
                      { value: "", label: "Pilih Syarat Pembayaran" },
                      ...SYARAT_PEMBAYARAN_OPTIONS.map((opt) => ({ value: opt, label: opt })),
                    ]}
                  />
                </Field>
              </div>
              <Field label="Alamat">
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Masukkan alamat lengkap"
                  rows={2}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Alamat Pengiriman"
                action={
                  <button
                    type="button"
                    onClick={() => setAlamatPengiriman(alamat)}
                    className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Salin dari alamat utama
                  </button>
                }
              >
                <textarea
                  value={alamatPengiriman}
                  onChange={(e) => setAlamatPengiriman(e.target.value)}
                  placeholder="Masukkan alamat pengiriman (opsional)"
                  rows={2}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Alamat Penagihan"
                action={
                  <button
                    type="button"
                    onClick={() => setAlamatPenagihan(alamat)}
                    className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Salin dari alamat utama
                  </button>
                }
              >
                <textarea
                  value={alamatPenagihan}
                  onChange={(e) => setAlamatPenagihan(e.target.value)}
                  placeholder="Masukkan alamat penagihan (opsional)"
                  rows={2}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="space-y-4 border-t border-zinc-100 pt-5">
              <p className="text-sm font-semibold text-zinc-700">PIC & Status</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama PIC">
                  <input
                    value={namaPIC}
                    onChange={(e) => setNamaPIC(e.target.value)}
                    placeholder="Masukkan nama PIC"
                    className={inputClass}
                  />
                </Field>
                <Field label="Kontak PIC">
                  <input
                    value={kontakPIC}
                    onChange={(e) => setKontakPIC(e.target.value)}
                    placeholder="+62812345678"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Status">
                <Select
                  value={status}
                  onChange={(v) => setStatus(v as StatusSupplier)}
                  options={[
                    { value: "aktif", label: "Aktif" },
                    { value: "nonaktif", label: "Nonaktif" },
                  ]}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <X className="h-4 w-4" />
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

function Field({
  label,
  required,
  action,
  children,
}: {
  label: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {action}
      </span>
      {children}
    </label>
  );
}
