"use client";

import { formatNumberId, parseNumberId } from "@/lib/format";
import { DiskonTipe } from "@/lib/types";

interface DiskonItemInputProps {
  tipe: DiskonTipe;
  persen: number;
  rupiah: number;
  onChange: (patch: { diskonTipe: DiskonTipe; diskonPersen: number; diskonRp: number }) => void;
  className?: string;
}

export function DiskonItemInput({ tipe, persen, rupiah, onChange, className }: DiskonItemInputProps) {
  const isRupiah = tipe === "rupiah";

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => onChange({ diskonTipe: isRupiah ? "persen" : "rupiah", diskonPersen: persen, diskonRp: rupiah })}
        aria-label="Ganti mode diskon (persen/rupiah)"
        className="shrink-0 rounded border border-zinc-200 px-1.5 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50"
      >
        {isRupiah ? "Rp" : "%"}
      </button>
      {isRupiah ? (
        <input
          type="text"
          inputMode="numeric"
          value={formatNumberId(rupiah)}
          onChange={(e) =>
            onChange({ diskonTipe: "rupiah", diskonPersen: persen, diskonRp: parseNumberId(e.target.value) })
          }
          placeholder="0"
          className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-right text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      ) : (
        <div className="relative w-full">
          <input
            type="number"
            min={0}
            max={100}
            value={persen || ""}
            onChange={(e) =>
              onChange({ diskonTipe: "persen", diskonPersen: Number(e.target.value) || 0, diskonRp: rupiah })
            }
            placeholder="0"
            className="w-full rounded-lg border border-zinc-200 py-1.5 pl-2 pr-6 text-right text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
        </div>
      )}
    </div>
  );
}
