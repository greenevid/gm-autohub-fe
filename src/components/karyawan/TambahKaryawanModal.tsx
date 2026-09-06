"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Karyawan, Posisi, SATUAN_GAJI_OPTIONS, SatuanGaji, StatusKaryawan } from "@/lib/types";
import { SearchSelectField } from "@/components/ui/SearchSelectField";
import { Select } from "@/components/ui/Select";
import { TambahPosisiModal } from "@/components/karyawan/TambahPosisiModal";

interface TambahKaryawanModalProps {
  karyawan?: Karyawan;
  posisiList: Posisi[];
  onClose: () => void;
  onSaved: (karyawan: Karyawan) => void;
  onPosisiCreated?: (posisi: Posisi) => void;
}

export function TambahKaryawanModal({
  karyawan,
  posisiList,
  onClose,
  onSaved,
  onPosisiCreated,
}: TambahKaryawanModalProps) {
  const isEdit = Boolean(karyawan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posisiOptions, setPosisiOptions] = useState(posisiList);
  const [posisiModalOpen, setPosisiModalOpen] = useState(false);

  const [nama, setNama] = useState(karyawan?.nama ?? "");
  const [email, setEmail] = useState(karyawan?.email ?? "");
  const [telepon, setTelepon] = useState(karyawan?.telepon ?? "");
  const [nik, setNik] = useState(karyawan?.nik ?? "");
  const [alamat, setAlamat] = useState(karyawan?.alamat ?? "");

  const initialPosisiNama = posisiList.find((p) => p.id === karyawan?.posisiId)?.nama ?? "";
  const [posisiNama, setPosisiNama] = useState(initialPosisiNama);
  const [tanggalMasuk, setTanggalMasuk] = useState(
    karyawan?.tanggalMasuk ?? new Date().toISOString().slice(0, 10)
  );

  const [satuanGaji, setSatuanGaji] = useState<SatuanGaji>(karyawan?.satuanGaji ?? "per_bulan");
  const [gaji, setGaji] = useState(String(karyawan?.gaji ?? 0));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const matchedPosisi = posisiOptions.find((p) => p.nama.toLowerCase() === posisiNama.trim().toLowerCase());
      const payload = {
        nama,
        email: email || undefined,
        telepon: telepon || undefined,
        nik: nik || undefined,
        alamat: alamat || undefined,
        posisiId: matchedPosisi?.id,
        tanggalMasuk,
        satuanGaji,
        gaji: Number(gaji) || 0,
        status: (karyawan?.status ?? "aktif") as StatusKaryawan,
      };
      const saved = isEdit ? await api.updateKaryawan(karyawan!.id, payload) : await api.createKaryawan(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan karyawan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Karyawan" : "Tambah Karyawan"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
              <p className="text-sm font-semibold text-zinc-700">Informasi Pribadi</p>
              <Field label="Nama Karyawan" required>
                <input
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama karyawan"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email"
                    className={inputClass}
                  />
                </Field>
                <Field label="Nomor Telepon">
                  <input
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="Masukkan nomor telepon"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="NIK">
                  <input value={nik} onChange={(e) => setNik(e.target.value)} placeholder="Masukkan NIK" className={inputClass} />
                </Field>
                <Field label="Alamat">
                  <input
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Masukkan alamat"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-100 pt-5">
              <p className="text-sm font-semibold text-zinc-700">Informasi Ketenagakerjaan</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Posisi">
                  <SearchSelectField
                    value={posisiNama}
                    onChange={setPosisiNama}
                    options={posisiOptions.map((p) => ({ id: p.id, label: p.nama }))}
                    onAddNew={() => setPosisiModalOpen(true)}
                    placeholder="Cari posisi..."
                    emptyLabel="Posisi tidak ditemukan, klik + untuk menambahkan"
                  />
                </Field>
                <Field label="Tanggal Masuk" required>
                  <input
                    required
                    type="date"
                    value={tanggalMasuk}
                    onChange={(e) => setTanggalMasuk(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-100 pt-5">
              <p className="text-sm font-semibold text-zinc-700">Kompensasi</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Satuan Gaji">
                  <Select
                    value={satuanGaji}
                    onChange={(v) => setSatuanGaji(v as SatuanGaji)}
                    options={SATUAN_GAJI_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  />
                </Field>
                <Field label="Gaji" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                      Rp
                    </span>
                    <input
                      required
                      type="number"
                      min={0}
                      value={gaji}
                      onChange={(e) => setGaji(e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 px-6 py-4">
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
              {submitting ? "Menyimpan..." : isEdit ? "Perbarui" : "Tambahkan"}
            </button>
          </div>
        </form>
      </div>

      {posisiModalOpen && (
        <TambahPosisiModal
          onClose={() => setPosisiModalOpen(false)}
          onSaved={(saved) => {
            setPosisiOptions((prev) => [...prev, saved]);
            setPosisiNama(saved.nama);
            onPosisiCreated?.(saved);
          }}
        />
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
