"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import clsx from "clsx";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  min?: string;
  max?: string;
  "aria-label"?: string;
}

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function parseIso(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const d = parseIso(value);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DateInput({ value, onChange, placeholder = "dd/mm/yyyy", className, id, min, max, ...rest }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = parseIso(value);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const minDate = min ? parseIso(min) : null;
  const maxDate = max ? parseIso(max) : null;

  function isDisabled(d: Date) {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      <button
        type="button"
        id={id}
        onClick={() =>
          setOpen((o) => {
            const next = !o;
            if (next) setViewDate(selected ?? new Date());
            return next;
          })
        }
        aria-label={rest["aria-label"]}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-900 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 hover:border-green-200",
          !value && "text-zinc-400"
        )}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <span className="flex items-center gap-1.5">
          {value && (
            <X
              className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
          )}
          <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="rounded p-1 hover:bg-zinc-100"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-zinc-900">
              {BULAN[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="rounded p-1 hover:bg-zinc-100"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400">
            {HARI.map((h) => (
              <span key={h} className="py-1">
                {h}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled(d)}
                  onClick={() => {
                    onChange(toIso(d));
                    setOpen(false);
                  }}
                  className={clsx(
                    "rounded-md py-1.5 text-sm transition-colors",
                    isDisabled(d)
                      ? "cursor-not-allowed text-zinc-300"
                      : selected && isSameDay(d, selected)
                        ? "bg-green-600 font-semibold text-white"
                        : isSameDay(d, new Date())
                          ? "bg-green-50 font-medium text-green-700"
                          : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
