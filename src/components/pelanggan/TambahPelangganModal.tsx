"use client";

import { FormEvent, useState } from "react";
import { X, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { Pelanggan, StatusPelanggan } from "@/lib/types";
import { LookupSearchSelectField } from "@/components/ui/LookupSearchSelectField";
import { DateInput } from "@/components/ui/DateInput";

interface TambahPelangganModalProps {
  pelanggan?: Pelanggan;
  onClose: () => void;
  onSaved: (pelanggan: Pelanggan) => void;
}

export function TambahPelangganModal({ pelanggan, onClose, onSaved }: TambahPelangganModalProps) {
  const isEdit = Boolean(pelanggan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState(pelanggan?.nama ?? "");
  const [tipe, setTipe] = useState(pelanggan?.tipe ?? "");
  const [telepon, setTelepon] = useState(pelanggan?.telepon ?? "");
  const [email, setEmail] = useState(pelanggan?.email ?? "");
  const [npwp, setNpwp] = useState(pelanggan?.npwp ?? "");
  const [nik, setNik] = useState(pelanggan?.nik ?? "");
  const [tanggalLahir, setTanggalLahir] = useState(pelanggan?.tanggalLahir ?? "");

  const [kota, setKota] = useState(pelanggan?.kota ?? "");
  const [syaratPembayaran, setSyaratPembayaran] = useState(pelanggan?.syaratPembayaran ?? "");
  const [alamat, setAlamat] = useState(pelanggan?.alamat ?? "");
  const [alamatPengiriman, setAlamatPengiriman] = useState(pelanggan?.alamatPengiriman ?? "");
  const [alamatPenagihan, setAlamatPenagihan] = useState(pelanggan?.alamatPenagihan ?? "");

  const [namaPIC, setNamaPIC] = useState(pelanggan?.namaPIC ?? "");
  const [kontakPIC, setKontakPIC] = useState(pelanggan?.kontakPIC ?? "");
  const [plafonKredit, setPlafonKredit] = useState(
    pelanggan?.plafonKredit !== undefined ? String(pelanggan.plafonKredit) : ""
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nama,
        tipe: tipe || undefined,
        telepon,
        email,
        npwp: npwp || undefined,
        nik: nik || undefined,
        tanggalLahir: tanggalLahir || undefined,
        kota,
        syaratPembayaran: syaratPembayaran || undefined,
        alamat,
        alamatPengiriman: alamatPengiriman || undefined,
        alamatPenagihan: alamatPenagihan || undefined,
        namaPIC: namaPIC || undefined,
        kontakPIC: kontakPIC || undefined,
        plafonKredit: plafonKredit ? Number(plafonKredit) : undefined,
      };
      const saved = isEdit
        ? await api.updatePelanggan(pelanggan!.id, payload)
        : await api.createPelanggan({ ...payload, status: "aktif" as StatusPelanggan });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pelanggan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Pelanggan" : "Pelanggan Baru"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
              <p className="text-sm font-semibold text-zinc-700">Informasi Dasar</p>
              <Field label="Nama Pelanggan" required>
                <input
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama pelanggan"
                  className={inputClass}
                />
              </Field>
              <Field label="Tipe Pelanggan">
                <LookupSearchSelectField
                  tipe="tipe-pelanggan"
                  label="Tipe Pelanggan"
                  value={tipe}
                  onChange={setTipe}
                  placeholder="Cari tipe pelanggan..."
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nomor Handphone" required>
                  <input
                    required
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="081234567890 atau +62812345678"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelanggan@example.com"
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
              <Field label="Tanggal Lahir">
                <DateInput value={tanggalLahir} onChange={setTanggalLahir} />
              </Field>
            </div>

            <div className="space-y-4 border-t border-zinc-100 pt-5">
              <p className="text-sm font-semibold text-zinc-700">Informasi Tambahan</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kota" required>
                  <input
                    required
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Jakarta"
                    className={inputClass}
                  />
                </Field>
                <Field label="Syarat Pembayaran">
                  <LookupSearchSelectField
                    tipe="syarat-pembayaran"
                    label="Syarat Pembayaran"
                    value={syaratPembayaran}
                    onChange={setSyaratPembayaran}
                    placeholder="Cari syarat pembayaran..."
                    showJatuhTempo
                  />
                </Field>
              </div>
              <Field label="Alamat" required>
                <textarea
                  required
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
              <p className="text-sm font-semibold text-zinc-700">PIC & Keuangan</p>
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
              <Field label="Plafon Kredit">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={plafonKredit}
                    onChange={(e) => setPlafonKredit(e.target.value)}
                    placeholder="Masukkan plafon kredit"
                    className={`${inputClass} pl-9`}
                  />
                </div>
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
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Pelanggan"}
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
