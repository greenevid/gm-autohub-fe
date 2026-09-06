"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Lookup, LookupTipe } from "@/lib/types";
import { EmptyState } from "@/components/ui/Panel";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { TambahLookupModal } from "./TambahLookupModal";

interface LookupSectionProps {
  tipe: LookupTipe;
  groupLabel: string;
  label: string;
  subtitle: string;
  showJatuhTempo?: boolean;
}

export function LookupSection({ tipe, groupLabel, label, subtitle, showJatuhTempo }: LookupSectionProps) {
  const [data, setData] = useState<Lookup[] | null>(null);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState<{ open: boolean; edit?: Lookup }>({ open: false });

  function refresh() {
    api.lookup(tipe).then(setData);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!data) return null;
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) => d.nama.toLowerCase().includes(q));
  }, [data, search]);

  const paged = filtered ? paginate(filtered, page, pageSize) : null;

  async function handleDelete(item: Lookup) {
    if (!confirm(`Hapus ${label.toLowerCase()} "${item.nama}"?`)) return;
    await api.deleteLookup(item.id);
    refresh();
  }

  return (
    <div className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{groupLabel}</p>
      <h2 className="mt-1 text-xl font-bold text-zinc-900">{label}</h2>
      <p className="text-sm text-zinc-500">{subtitle}</p>

      <div className="mt-5 mb-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Cari ${label.toLowerCase()}...`}
            className="w-full max-w-sm rounded-lg border border-zinc-200 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setModalState({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Tambah {label}
        </button>
      </div>

      {!paged ? (
        <p className="text-sm text-zinc-400">Memuat…</p>
      ) : paged.length === 0 ? (
        <EmptyState label={`Belum ada data ${label.toLowerCase()}`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
                <th className="py-2 pr-4 font-medium">No</th>
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Deskripsi</th>
                {showJatuhTempo && <th className="py-2 pr-4 font-medium">Jatuh Tempo (Hari)</th>}
                <th className="py-2 pr-0 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item, index) => (
                <tr key={item.id} className="border-b border-zinc-50 last:border-0">
                  <td className="py-3 pr-4 text-zinc-500">{(page - 1) * pageSize + index + 1}</td>
                  <td className="py-3 pr-4 font-medium text-zinc-900">{item.nama}</td>
                  <td className="py-3 pr-4 text-zinc-500">{item.deskripsi || "-"}</td>
                  {showJatuhTempo && (
                    <td className="py-3 pr-4 text-zinc-500">{item.jatuhTempoHari ?? "-"}</td>
                  )}
                  <td className="py-3 pr-0">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${item.nama}`}
                        onClick={() => setModalState({ open: true, edit: item })}
                        className="rounded p-1.5 text-blue-500 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus ${item.nama}`}
                        onClick={() => handleDelete(item)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      {modalState.open && (
        <TambahLookupModal
          tipe={tipe}
          label={label}
          item={modalState.edit}
          showJatuhTempo={showJatuhTempo}
          onClose={() => setModalState({ open: false })}
          onSaved={() => refresh()}
        />
      )}
    </div>
  );
}
