"use client";

import { Plus, Search } from "lucide-react";

interface SearchAddFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

export function SearchAddField({ value, onChange, placeholder, required }: SearchAddFieldProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
