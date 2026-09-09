"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { CompanyProfile, Pembelian, Supplier } from "@/lib/types";
import { formatDateFull, formatRupiah, hitungTotalSetelahDiskon } from "@/lib/format";

export default function CetakPembelianPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [pembelian, setPembelian] = useState<Pembelian | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .getPembelian(id)
      .then((p) => {
        setPembelian(p);
        api.getSupplier(p.supplierId).then(setSupplier);
      })
      .catch(() => setNotFound(true));
    api.getCompanyProfile().then(setProfile);
  }, [id]);

  const ready = Boolean(pembelian && supplier && profile);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, [ready]);

  if (notFound) {
    return <div className="p-8 text-sm text-zinc-400">Data invoice tidak ditemukan.</div>;
  }
  if (!pembelian || !supplier || !profile) {
    return <div className="p-8 text-sm text-zinc-400">Memuat dokumen…</div>;
  }

  const subtotal = pembelian.subtotal ?? pembelian.total;
  const dpp = pembelian.dpp ?? subtotal;
  const diskonNominal = subtotal - dpp;
  const pajakNominal = pembelian.pajak ?? 0;
  const bebasPpn = pembelian.bebasPpn ?? false;
  const ongkir = pembelian.biayaPengiriman ?? 0;
  const lainnya = pembelian.biayaLainnya ?? 0;

  return (
    <div className="min-h-screen bg-zinc-100 print:bg-white">
      <style>{`@page { size: A4; margin: 12mm; }`}</style>

      <div className="mx-auto flex max-w-3xl items-center justify-between py-4 print:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
        >
          <Printer className="h-4 w-4" />
          Cetak
        </button>
      </div>

      <div className="relative mx-auto w-[210mm] bg-white p-[15mm] shadow-lg print:w-auto print:shadow-none">
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 overflow-hidden">
          <div className="h-40 w-40 -translate-y-8 translate-x-8 rotate-45 bg-green-600" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-gmi.png" alt="Logo" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-2xl font-bold leading-none text-zinc-900">{profile.namaPerusahaan}</p>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-green-700">INDONESIA</p>
              <p className="mt-1 text-xs text-zinc-500">{profile.alamat}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-300 p-3 text-sm">
            <Row label="Supplier" value={supplier.nama} bold />
            <Row label="Alamat" value={supplier.alamat} />
            <Row label="Telepon" value={supplier.telepon || "-"} />
          </div>
          <div className="rounded-lg border border-zinc-300 p-3 text-sm">
            <p className="text-lg font-bold text-zinc-900">INVOICE PEMBELIAN: {pembelian.kode}</p>
            <Row label="Tanggal" value={formatDateFull(pembelian.tanggal)} />
            {pembelian.jatuhTempo && <Row label="Jatuh Tempo" value={formatDateFull(pembelian.jatuhTempo)} />}
            {pembelian.syaratPembayaran && <Row label="Syarat" value={pembelian.syaratPembayaran} />}
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-600 text-left text-white">
              <th className="px-3 py-2 font-semibold">Items</th>
              <th className="px-3 py-2 text-right font-semibold">Qty</th>
              <th className="px-3 py-2 font-semibold">Satuan</th>
              <th className="px-3 py-2 text-right font-semibold">Harga</th>
              <th className="px-3 py-2 text-right font-semibold">Diskon</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {pembelian.items.map((item, i) => {
              const gross = item.qty * item.hargaSatuan;
              const rowTotal = hitungTotalSetelahDiskon(gross, item.diskonTipe, item.diskonPersen, item.diskonRp ?? 0);
              const rowDiskon = gross - rowTotal;
              return (
                <tr key={`${item.itemId}-${i}`} className="border-b border-zinc-200">
                  <td className="px-3 py-2">{item.nama}</td>
                  <td className="px-3 py-2 text-right">{item.qty}</td>
                  <td className="px-3 py-2">{item.satuan ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(item.hargaSatuan)}</td>
                  <td className="px-3 py-2 text-right">{rowDiskon > 0 ? formatRupiah(rowDiskon) : "-"}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(rowTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-3 flex justify-end">
          <table className="w-64 text-sm">
            <tbody>
              <tr className="border-b border-zinc-200">
                <td className="py-1.5 font-medium">Subtotal</td>
                <td className="py-1.5 text-right">{formatRupiah(subtotal)}</td>
              </tr>
              {diskonNominal > 0 && (
                <tr className="border-b border-zinc-200">
                  <td className="py-1.5 font-medium">Diskon</td>
                  <td className="py-1.5 text-right">-{formatRupiah(diskonNominal)}</td>
                </tr>
              )}
              <tr className="border-b border-zinc-200">
                <td className="py-1.5 font-medium">{bebasPpn ? "Pajak (Bebas PPN)" : `Pajak (${pembelian.pajakPersen ?? 0}%)`}</td>
                <td className="py-1.5 text-right">{formatRupiah(pajakNominal)}</td>
              </tr>
              {ongkir > 0 && (
                <tr className="border-b border-zinc-200">
                  <td className="py-1.5 font-medium">Biaya Pengiriman</td>
                  <td className="py-1.5 text-right">{formatRupiah(ongkir)}</td>
                </tr>
              )}
              {lainnya > 0 && (
                <tr className="border-b border-zinc-200">
                  <td className="py-1.5 font-medium">Biaya Lainnya</td>
                  <td className="py-1.5 text-right">{formatRupiah(lainnya)}</td>
                </tr>
              )}
              <tr>
                <td className="py-1.5 text-base font-bold">Total</td>
                <td className="py-1.5 text-right text-base font-bold">{formatRupiah(pembelian.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-20 flex justify-between text-center text-sm">
          <div>
            <p className="mb-16">Supplier</p>
            <p className="border-t border-zinc-400 pt-1">{supplier.nama}</p>
          </div>
          <div>
            <p className="mb-16"></p>
            <p className="border-t border-zinc-400 pt-1">{profile.namaPerusahaan}</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500">
          <span>{profile.telepon}</span>
          <span>{profile.email}</span>
          <span>{profile.alamat}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-zinc-500">{label}</span>
      <span className={`flex-1 ${bold ? "font-semibold text-zinc-900" : "text-zinc-700"}`}>: {value}</span>
    </div>
  );
}
