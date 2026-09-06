"use client";

import { FormEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Pembelian, ReturPembelian, Supplier } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { Select } from "@/components/ui/Select";

interface TambahReturPembelianModalProps {
  pembelianList: Pembelian[];
  supplierList: Supplier[];
  onClose: () => void;
  onCreated: (retur: ReturPembelian) => void;
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

export function TambahReturPembelianModal({
  pembelianList,
  supplierList,
  onClose,
  onCreated,
}: TambahReturPembelianModalProps) {
  const [pembelianId, setPembelianId] = useState("");
  const [alasan, setAlasan] = useState("");
  const [qtyByItem, setQtyByItem] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pembelian = pembelianList.find((p) => p.id === pembelianId);

  const total = useMemo(() => {
    if (!pembelian) return 0;
    return pembelian.items.reduce((sum, item) => {
      const qty = qtyByItem[item.itemId] ?? 0;
      return sum + qty * item.hargaSatuan;
    }, 0);
  }, [pembelian, qtyByItem]);

  function selectPembelian(id: string) {
    setPembelianId(id);
    setQtyByItem({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const items = Object.entries(qtyByItem)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));

    if (!pembelianId || items.length === 0) {
      setError("Pilih pembelian dan tentukan jumlah item yang diretur");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createReturPembelian({ pembelianId, alasan: alasan || undefined, items });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan retur pembelian");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between bg-green-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">Retur Pembelian Baru</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Pembelian <span className="text-red-500">*</span>
              </span>
              <Select
                value={pembelianId}
                onChange={selectPembelian}
                options={[
                  { value: "", label: "Pilih pembelian..." },
                  ...pembelianList
                    .filter((p) => p.status === "selesai")
                    .map((p) => ({
                      value: p.id,
                      label: `${p.kode} · ${supplierList.find((s) => s.id === p.supplierId)?.nama ?? "-"} · ${formatRupiah(p.total)}`,
                    })),
                ]}
              />
            </label>

            {pembelian && (
              <div>
                <p className="mb-2 text-sm font-semibold text-zinc-900">Item yang diretur</p>
                <ul className="space-y-2">
                  {pembelian.items.map((item) => (
                    <li
                      key={item.itemId}
                      className="flex items-center gap-3 rounded-lg border border-zinc-100 p-2.5"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">{item.nama}</p>
                        <p className="text-xs text-zinc-400">
                          {formatRupiah(item.hargaSatuan)} / unit · dibeli {item.qty}
                        </p>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={item.qty}
                        value={qtyByItem[item.itemId] ?? 0}
                        onChange={(e) =>
                          setQtyByItem((prev) => ({
                            ...prev,
                            [item.itemId]: Math.min(Number(e.target.value) || 0, item.qty),
                          }))
                        }
                        className="w-20 rounded-lg border border-zinc-200 px-2 py-1.5 text-center text-sm"
                        aria-label={`Qty retur ${item.nama}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Alasan Retur</span>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Alasan retur (opsional)"
                rows={3}
                className={inputClass}
              />
            </label>

            {pembelian && (
              <div className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50/60 p-4">
                <span className="text-sm font-semibold text-zinc-900">Total Pengembalian</span>
                <span className="text-lg font-bold text-green-600">{formatRupiah(total)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Buat Retur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
