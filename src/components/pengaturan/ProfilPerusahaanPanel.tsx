"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CompanyProfile } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

export function ProfilPerusahaanPanel() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getCompanyProfile().then(setProfile);
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.updateCompanyProfile(profile);
      setProfile(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Profil Perusahaan</p>
      <h2 className="mt-1 text-xl font-bold text-zinc-900">Profil Perusahaan</h2>
      <p className="text-sm text-zinc-500">
        Informasi ini akan tampil pada dokumen cetak (Invoice, Proforma Invoice, dan Kwitansi).
      </p>

      {!profile ? (
        <p className="mt-5 text-sm text-zinc-400">Memuat…</p>
      ) : (
        <div className="mt-5 space-y-5 border-t border-zinc-100 pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nama Perusahaan</span>
              <input
                value={profile.namaPerusahaan}
                onChange={(e) => {
                  setProfile({ ...profile, namaPerusahaan: e.target.value });
                  setSaved(false);
                }}
                placeholder="Nama bengkel / perusahaan"
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Alamat</span>
              <textarea
                value={profile.alamat}
                onChange={(e) => {
                  setProfile({ ...profile, alamat: e.target.value });
                  setSaved(false);
                }}
                rows={2}
                placeholder="Alamat lengkap"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Telepon</span>
              <input
                value={profile.telepon}
                onChange={(e) => {
                  setProfile({ ...profile, telepon: e.target.value });
                  setSaved(false);
                }}
                placeholder="0878 9708 9800"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Email</span>
              <input
                value={profile.email}
                onChange={(e) => {
                  setProfile({ ...profile, email: e.target.value });
                  setSaved(false);
                }}
                placeholder="info@perusahaan.com"
                className={inputClass}
              />
            </label>
          </div>

          <div className="space-y-4 rounded-lg bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-900">Rekening Bank</p>
            <p className="-mt-2 text-xs text-zinc-400">
              Ditampilkan pada petunjuk pembayaran di Invoice dan Proforma Invoice.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nama Bank</span>
                <input
                  value={profile.bankNama}
                  onChange={(e) => {
                    setProfile({ ...profile, bankNama: e.target.value });
                    setSaved(false);
                  }}
                  placeholder="Bank Mandiri"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nomor Rekening</span>
                <input
                  value={profile.bankNoRekening}
                  onChange={(e) => {
                    setProfile({ ...profile, bankNoRekening: e.target.value });
                    setSaved(false);
                  }}
                  placeholder="161-00-6660007-8"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Atas Nama</span>
                <input
                  value={profile.bankAtasNama}
                  onChange={(e) => {
                    setProfile({ ...profile, bankAtasNama: e.target.value });
                    setSaved(false);
                  }}
                  placeholder="PT. Nama Perusahaan"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
            {saved && <span className="text-sm text-emerald-600">Tersimpan</span>}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
