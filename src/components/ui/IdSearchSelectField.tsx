"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";

interface IdSearchSelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface IdSearchSelectFieldProps {
  value: string;
  onChange: (id: string) => void;
  options: IdSearchSelectOption[];
  onAddNew?: () => void;
  placeholder: string;
  required?: boolean;
  emptyLabel?: string;
}

// Like SearchSelectField, but the committed value/onChange is the option's id, not its label --
// needed anywhere the picked record's id must be sent to the API (e.g. pelangganId).
export function IdSearchSelectField({
  value,
  onChange,
  options,
  onAddNew,
  placeholder,
  required,
  emptyLabel = "Tidak ditemukan",
}: IdSearchSelectFieldProps) {
  const [open, setOpen] = useState(false);
  // null = not actively editing -> display text is derived from `value`/`options` below.
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayValue = typedQuery ?? options.find((o) => o.id === value)?.label ?? "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setTypedQuery(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = displayValue.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  return (
    <div ref={containerRef} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          required={required}
          value={displayValue}
          onChange={(e) => {
            setTypedQuery(e.target.value);
            onChange("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        {open && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-zinc-400">{emptyLabel}</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setTypedQuery(null);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col px-3 py-1.5 text-left text-sm hover:bg-zinc-50"
                >
                  <span className="text-zinc-900">{o.label}</span>
                  {o.sublabel && <span className="text-xs text-zinc-400">{o.sublabel}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="Tambah baru"
        onClick={onAddNew}
        disabled={!onAddNew}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
