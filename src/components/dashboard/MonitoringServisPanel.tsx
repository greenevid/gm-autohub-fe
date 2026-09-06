"use client";

import { useState } from "react";
import clsx from "clsx";
import { Target } from "lucide-react";
import { Kendaraan, Servis, StatusServis } from "@/lib/types";
import { kendaraanLabel } from "@/lib/dashboard";
import { EmptyState } from "@/components/ui/Panel";

const TABS: { key: StatusServis; label: string }[] = [
  { key: "antrian", label: "Antrian" },
  { key: "dikerjakan", label: "Dikerjakan" },
  { key: "menunggu_sparepart", label: "Menunggu Sparepart" },
];

interface MonitoringServisPanelProps {
  servis: Servis[];
  kendaraan: Kendaraan[];
}

export function MonitoringServisPanel({ servis, kendaraan }: MonitoringServisPanelProps) {
  const [tab, setTab] = useState<StatusServis>("antrian");

  const filtered = servis
    .filter((s) => s.status === tab)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <Target className="h-4 w-4 text-green-600" />
            Monitoring Servis
          </h3>
          <p className="text-xs text-zinc-400">Pantau progres servis kendaraan pelanggan</p>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-zinc-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              "border-b-2 px-3 pb-2 text-xs font-semibold transition-colors",
              tab === t.key
                ? "border-green-600 text-green-600"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState label="Tidak ada servis di kategori ini" />
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <li key={s.id} className="rounded-lg border border-zinc-100 p-3">
              <p className="text-sm font-medium text-zinc-900">
                {kendaraanLabel(kendaraan.find((k) => k.id === s.kendaraanId))}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{s.keluhan}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
