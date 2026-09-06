"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PajakSetting } from "@/lib/types";
import { Toggle } from "@/components/ui/Toggle";

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

export function PajakSettingPanel() {
  const [setting, setSetting] = useState<PajakSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPajak().then(setSetting);
  }, []);

  async function handleSave() {
    if (!setting) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.updatePajak(setting);
      setSetting(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Pembayaran</p>
      <h2 className="mt-1 text-xl font-bold text-zinc-900">Pajak</h2>
      <p className="text-sm text-zinc-500">Konfigurasi perhitungan pajak untuk penjualan dan pembelian.</p>

      {!setting ? (
        <p className="mt-5 text-sm text-zinc-400">Memuat…</p>
      ) : (
        <div className="mt-5 space-y-5 border-t border-zinc-100 pt-5">
          <p className="text-sm font-semibold text-zinc-900">Pengaturan Pajak</p>
          <p className="-mt-3 text-xs text-zinc-400">Konfigurasi perhitungan pajak untuk transaksi</p>

          <div className="rounded-lg bg-zinc-50 p-4">
            <Toggle
              checked={setting.aktif}
              onChange={(checked) => {
                setSetting({ ...setting, aktif: checked });
                setSaved(false);
              }}
              label="Aktifkan Pajak"
              hint="Aktifkan perhitungan pajak untuk semua transaksi (Penjualan & Pembelian)"
            />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Persentase Pajak (%)</span>
            <div className="relative max-w-xs">
              <input
                type="number"
                min={0}
                max={100}
                value={setting.persentase}
                onChange={(e) => {
                  setSetting({ ...setting, persentase: Number(e.target.value) || 0 });
                  setSaved(false);
                }}
                className={`${inputClass} pr-8`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                %
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Nilai persentase ini akan diterapkan pada semua transaksi yang dikenakan pajak.</p>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Nilai Pembulatan</span>
            <input
              type="number"
              min={0}
              value={setting.pembulatan}
              onChange={(e) => {
                setSetting({ ...setting, pembulatan: Number(e.target.value) || 0 });
                setSaved(false);
              }}
              className={`${inputClass} max-w-xs`}
            />
            <p className="mt-1 text-xs text-zinc-400">Nilai ini digunakan untuk pembulatan total transaksi.</p>
          </label>

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
