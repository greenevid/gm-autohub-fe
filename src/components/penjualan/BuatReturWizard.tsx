"use client";

import { FormEvent, useMemo, useState } from "react";
import clsx from "clsx";
import { Package, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { Invoice, Pelanggan, Retur, StatusRetur } from "@/lib/types";
import { formatDateLong, formatRupiah } from "@/lib/format";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { LookupSearchSelectField } from "@/components/ui/LookupSearchSelectField";
import { RupiahInput } from "@/components/ui/RupiahInput";

interface BuatReturWizardProps {
  invoiceList: Invoice[];
  pelangganList: Pelanggan[];
  onClose: () => void;
  onCreated: (retur: Retur) => void;
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const config = {
    selesai: { label: "Selesai", className: "bg-emerald-50 text-emerald-600" },
    draft: { label: "Draft", className: "bg-zinc-100 text-zinc-600" },
    dibatalkan: { label: "Dibatalkan", className: "bg-red-50 text-red-500" },
  }[status];
  return (
    <span className={clsx("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", config.className)}>
      {config.label}
    </span>
  );
}

function PembayaranBadge({ status }: { status: Invoice["statusPembayaran"] }) {
  const config = {
    lunas: { label: "Lunas", className: "bg-emerald-50 text-emerald-600" },
    belum_dibayar: { label: "Belum Dibayar", className: "bg-red-50 text-red-500" },
    dibayar_setengah: { label: "Dibayar Setengah", className: "bg-amber-50 text-amber-600" },
  }[status];
  return (
    <span className={clsx("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", config.className)}>
      {config.label}
    </span>
  );
}

export function BuatReturWizard({ invoiceList, pelangganList, onClose, onCreated }: BuatReturWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [invoiceId, setInvoiceId] = useState("");
  const [qtyByItem, setQtyByItem] = useState<Record<string, number>>({});
  const [alasan, setAlasan] = useState("");
  const [potonganPersen, setPotonganPersen] = useState("");
  const [potonganRp, setPotonganRp] = useState("");
  const [pajakPersen, setPajakPersen] = useState("");
  const [submitting, setSubmitting] = useState<StatusRetur | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eligibleInvoices = useMemo(() => invoiceList.filter((i) => i.status === "selesai"), [invoiceList]);

  function pelangganNama(id: string) {
    return pelangganList.find((p) => p.id === id)?.nama ?? "-";
  }

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligibleInvoices;
    return eligibleInvoices.filter(
      (i) => i.kode.toLowerCase().includes(q) || pelangganNama(i.pelangganId).toLowerCase().includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleInvoices, pelangganList, search]);

  const invoice = invoiceList.find((i) => i.id === invoiceId);

  function selectInvoice(id: string) {
    const inv = invoiceList.find((i) => i.id === id);
    const initialQty: Record<string, number> = {};
    inv?.items.forEach((item) => {
      initialQty[item.itemId] = item.qty;
    });
    setInvoiceId(id);
    setQtyByItem(initialQty);
    setError(null);
    setStep(2);
  }

  const subtotal = useMemo(() => {
    if (!invoice) return 0;
    return invoice.items.reduce((sum, item) => sum + (qtyByItem[item.itemId] ?? 0) * item.hargaSatuan, 0);
  }, [invoice, qtyByItem]);

  const potonganPersenNum = Number(potonganPersen) || 0;
  const potonganRpNum = Number(potonganRp) || 0;
  const pajakPersenNum = Number(pajakPersen) || 0;
  const afterPotongan = Math.max(subtotal * (1 - potonganPersenNum / 100) - potonganRpNum, 0);
  const pajakNominal = afterPotongan * (pajakPersenNum / 100);
  const totalRefund = afterPotongan + pajakNominal;

  async function submit(status: StatusRetur) {
    const items = Object.entries(qtyByItem)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));

    if (!invoiceId || items.length === 0) {
      setError("Pilih minimal satu item yang diretur");
      return;
    }
    if (!alasan) {
      setError("Pilih alasan retur");
      return;
    }

    setSubmitting(status);
    setError(null);
    try {
      const created = await api.createRetur({
        invoiceId,
        alasan,
        items,
        potonganPersen: potonganPersenNum || undefined,
        potonganRp: potonganRpNum || undefined,
        pajakPersen: pajakPersenNum || undefined,
        status,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan retur");
    } finally {
      setSubmitting(null);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit("selesai");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Buat Retur Penjualan</h2>
          <p className="text-sm text-zinc-500">
            Langkah {step}: {step === 1 ? "Pilih invoice yang akan diretur" : "Pilih item dan lengkapi detail retur"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {step === 1 && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="space-y-3 bg-green-600 p-5">
            <h3 className="text-base font-semibold text-white">Pilih Invoice</h3>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kode invoice atau nama customer..."
                className="w-full rounded-lg border-0 py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </div>
          </div>

          <div className="p-5">
            {filteredInvoices.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <Package className="h-8 w-8 text-zinc-300" />
                <p className="text-sm text-zinc-400">Tidak ada invoice yang cocok</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {paginate(filteredInvoices, page, pageSize).map((inv) => (
                  <li key={inv.id}>
                    <button
                      type="button"
                      onClick={() => selectInvoice(inv.id)}
                      className="grid w-full grid-cols-2 items-center gap-3 py-4 text-left transition-colors hover:bg-zinc-50 sm:grid-cols-5"
                    >
                      <div>
                        <p className="font-semibold text-green-600">{inv.kode}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <InvoiceStatusBadge status={inv.status} />
                          <PembayaranBadge status={inv.statusPembayaran} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Customer</p>
                        <p className="text-sm font-medium text-zinc-700">{pelangganNama(inv.pelangganId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Tanggal</p>
                        <p className="text-sm text-zinc-600">{formatDateLong(inv.tanggal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Item</p>
                        <p className="text-sm text-zinc-600">{inv.items.length} item</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400">Total</p>
                        <p className="text-sm font-bold text-zinc-900">{formatRupiah(inv.total)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={filteredInvoices.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {step === 2 && invoice && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 rounded-xl bg-green-600 p-5 text-white sm:grid-cols-3">
            <div>
              <p className="text-xs text-green-100">Invoice</p>
              <p className="text-lg font-bold">{invoice.kode}</p>
            </div>
            <div>
              <p className="text-xs text-green-100">Customer</p>
              <p className="text-lg font-semibold">{pelangganNama(invoice.pelangganId)}</p>
            </div>
            <div>
              <p className="text-xs text-green-100">Tanggal</p>
              <p className="text-lg font-semibold">{formatDateLong(invoice.tanggal)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Item yang Akan Diretur</h3>
            {invoice.items.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400">Tidak ada item dalam invoice ini</p>
            ) : (
              <ul className="space-y-2">
                {invoice.items.map((item) => (
                  <li key={item.itemId} className="flex items-center gap-3 rounded-lg border border-zinc-100 p-2.5">
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
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900">Detail Retur</h3>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                Alasan Retur <span className="text-red-500">*</span>
              </span>
              <LookupSearchSelectField
                tipe="alasan-retur"
                label="Alasan Retur"
                value={alasan}
                onChange={setAlasan}
                placeholder="Pilih alasan retur..."
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Potongan (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={potonganPersen}
                  onChange={(e) => setPotonganPersen(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Potongan (Rp)</span>
                <RupiahInput
                  value={potonganRp}
                  onChange={setPotonganRp}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">Pajak (%)</span>
                <input
                  type="number"
                  min={0}
                  value={pajakPersen}
                  onChange={(e) => setPajakPersen(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-green-100 bg-green-50/60 p-5">
            <h3 className="text-base font-semibold text-zinc-900">Ringkasan Refund</h3>
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {(potonganPersenNum > 0 || potonganRpNum > 0) && (
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Potongan</span>
                <span>- {formatRupiah(subtotal - afterPotongan)}</span>
              </div>
            )}
            {pajakPersenNum > 0 && (
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Pajak ({pajakPersenNum}%)</span>
                <span>{formatRupiah(pajakNominal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-green-200 pt-2">
              <span className="text-sm font-semibold text-zinc-900">Total Refund</span>
              <span className="text-lg font-bold text-green-600">{formatRupiah(totalRefund)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              ← Kembali
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!!submitting}
                onClick={() => submit("draft")}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
              >
                {submitting === "draft" ? "Menyimpan..." : "Simpan sebagai Draft"}
              </button>
              <button
                type="button"
                disabled={!!submitting}
                onClick={() => submit("ongoing")}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
              >
                {submitting === "ongoing" ? "Menyimpan..." : "Simpan sebagai Ongoing"}
              </button>
              <button
                type="submit"
                disabled={!!submitting}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                {submitting === "selesai" ? "Menyimpan..." : "Selesaikan Retur"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
