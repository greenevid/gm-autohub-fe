"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Building2,
  Car,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Package,
  RotateCcw,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { LookupTipe } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/Panel";
import { LookupSection } from "@/components/pengaturan/LookupSection";
import { PajakSettingPanel } from "@/components/pengaturan/PajakSettingPanel";
import { PosisiServisPanel } from "@/components/pengaturan/PosisiServisPanel";
import { ProfilPerusahaanPanel } from "@/components/pengaturan/ProfilPerusahaanPanel";

type SubItemKind = "lookup" | "pajak";

interface SubItem {
  key: string;
  label: string;
  subtitle: string;
  kind: SubItemKind;
  lookupTipe?: LookupTipe;
  showJatuhTempo?: boolean;
}

type GroupKey =
  | "profil-perusahaan"
  | "barang-jasa"
  | "pembayaran"
  | "penjualan"
  | "keuangan"
  | "supplier-pelanggan"
  | "posisi-servis"
  | "kendaraan";

interface NavGroup {
  key: GroupKey;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children?: SubItem[];
}

const GROUPS: NavGroup[] = [
  {
    key: "profil-perusahaan",
    icon: Building2,
    title: "Profil Perusahaan",
    subtitle: "Info perusahaan untuk dokumen cetak",
  },
  {
    key: "barang-jasa",
    icon: Package,
    title: "Barang & Jasa",
    subtitle: "Kelola pengaturan barang dan jasa",
    children: [
      { key: "kategori", label: "Kategori", subtitle: "Kelola kategori barang dan jasa", kind: "lookup", lookupTipe: "kategori" },
      { key: "brand", label: "Brand", subtitle: "Kelola brand barang dan jasa", kind: "lookup", lookupTipe: "brand" },
      { key: "unit", label: "Unit", subtitle: "Kelola unit barang dan jasa", kind: "lookup", lookupTipe: "unit" },
      { key: "jenis", label: "Jenis", subtitle: "Kelola jenis barang dan jasa", kind: "lookup", lookupTipe: "jenis" },
      { key: "grup", label: "Grup", subtitle: "Kelola grup barang dan jasa", kind: "lookup", lookupTipe: "grup" },
      { key: "model", label: "Model", subtitle: "Kelola model barang dan jasa", kind: "lookup", lookupTipe: "model" },
    ],
  },
  {
    key: "pembayaran",
    icon: CreditCard,
    title: "Pembayaran",
    subtitle: "Kelola pengaturan pembayaran",
    children: [
      { key: "tipe-pembayaran", label: "Tipe Pembayaran", subtitle: "Kelola tipe pembayaran", kind: "lookup", lookupTipe: "tipe-pembayaran" },
      {
        key: "syarat-pembayaran",
        label: "Syarat Pembayaran",
        subtitle: "Kelola syarat pembayaran",
        kind: "lookup",
        lookupTipe: "syarat-pembayaran",
        showJatuhTempo: true,
      },
      { key: "pajak", label: "Pajak", subtitle: "Konfigurasi perhitungan pajak untuk penjualan dan pembelian.", kind: "pajak" },
    ],
  },
  {
    key: "penjualan",
    icon: RotateCcw,
    title: "Penjualan",
    subtitle: "Kelola pengaturan penjualan",
    children: [
      { key: "alasan-retur", label: "Alasan Retur", subtitle: "Kelola daftar alasan retur penjualan", kind: "lookup", lookupTipe: "alasan-retur" },
    ],
  },
  {
    key: "keuangan",
    icon: Wallet,
    title: "Keuangan",
    subtitle: "Kelola kategori keuangan",
    children: [
      { key: "kategori-pemasukan", label: "Kategori Pemasukan", subtitle: "Kelola kategori pemasukan", kind: "lookup", lookupTipe: "kategori-pemasukan" },
      { key: "kategori-pengeluaran", label: "Kategori Pengeluaran", subtitle: "Kelola kategori pengeluaran", kind: "lookup", lookupTipe: "kategori-pengeluaran" },
    ],
  },
  {
    key: "supplier-pelanggan",
    icon: Users,
    title: "Supplier dan Pelanggan",
    subtitle: "Kelola tipe pelanggan dan supplier",
    children: [
      { key: "tipe-pelanggan", label: "Tipe Pelanggan", subtitle: "Kelola tipe pelanggan", kind: "lookup", lookupTipe: "tipe-pelanggan" },
      { key: "tipe-supplier", label: "Tipe Supplier", subtitle: "Kelola tipe supplier", kind: "lookup", lookupTipe: "tipe-supplier" },
    ],
  },
  {
    key: "posisi-servis",
    icon: Wrench,
    title: "Posisi untuk Servis",
    subtitle: "Konfigurasi posisi yang dapat ditugaskan ke servis",
  },
  {
    key: "kendaraan",
    icon: Car,
    title: "Kendaraan",
    subtitle: "Kelola pengaturan kendaraan",
    children: [
      { key: "tipe-kendaraan", label: "Tipe Kendaraan", subtitle: "Kelola tipe kendaraan", kind: "lookup", lookupTipe: "tipe-kendaraan" },
      { key: "brand-kendaraan", label: "Brand Kendaraan", subtitle: "Kelola brand kendaraan", kind: "lookup", lookupTipe: "brand-kendaraan" },
      { key: "model-kendaraan", label: "Model Kendaraan", subtitle: "Kelola model kendaraan", kind: "lookup", lookupTipe: "model-kendaraan" },
    ],
  },
];

export default function PengaturanPage() {
  const [activeGroup, setActiveGroup] = useState<GroupKey>("barang-jasa");
  const [activeSub, setActiveSub] = useState<string>("kategori");
  const [expanded, setExpanded] = useState<Set<GroupKey>>(new Set(["barang-jasa"]));

  function selectGroup(group: NavGroup) {
    if (group.children) {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(group.key)) next.delete(group.key);
        else next.add(group.key);
        return next;
      });
      if (!group.children.some((c) => c.key === activeSub) || activeGroup !== group.key) {
        setActiveSub(group.children[0].key);
      }
      setActiveGroup(group.key);
    } else {
      setActiveGroup(group.key);
    }
  }

  const activeGroupData = GROUPS.find((g) => g.key === activeGroup)!;
  const activeChild = activeGroupData.children?.find((c) => c.key === activeSub);

  return (
    <div className="flex-1 space-y-6 px-4 py-5 sm:px-8 sm:py-6">
      <PageHeader title="Pengaturan" subtitle="Kelola konfigurasi aplikasi" />

      <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:flex-row md:items-stretch">
        <div className="w-full shrink-0 space-y-1 border-b border-zinc-100 p-4 md:w-72 md:border-b-0 md:border-r">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = activeGroup === group.key;
            const isExpanded = expanded.has(group.key);
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => selectGroup(group)}
                  className={clsx(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    isActive && !group.children ? "bg-green-50 text-green-700" : "hover:bg-zinc-50"
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900">{group.title}</p>
                    <p className="text-xs text-zinc-400">{group.subtitle}</p>
                  </div>
                  {group.children &&
                    (isExpanded ? (
                      <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    ) : (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    ))}
                </button>

                {group.children && isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-zinc-100 pl-4">
                    {group.children.map((child) => (
                      <button
                        key={child.key}
                        type="button"
                        onClick={() => {
                          setActiveGroup(group.key);
                          setActiveSub(child.key);
                        }}
                        className={clsx(
                          "block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                          activeGroup === group.key && activeSub === child.key
                            ? "bg-green-50 text-green-600"
                            : "text-zinc-600 hover:bg-zinc-50"
                        )}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          {activeGroup === "posisi-servis" ? (
            <PosisiServisPanel />
          ) : activeGroup === "profil-perusahaan" ? (
            <ProfilPerusahaanPanel />
          ) : activeChild?.kind === "lookup" && activeChild.lookupTipe ? (
            <LookupSection
              key={activeChild.key}
              tipe={activeChild.lookupTipe}
              groupLabel={activeGroupData.title}
              label={activeChild.label}
              subtitle={activeChild.subtitle}
              showJatuhTempo={activeChild.showJatuhTempo}
            />
          ) : activeChild?.kind === "pajak" ? (
            <PajakSettingPanel />
          ) : (
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{activeGroupData.title}</p>
              <h2 className="mt-1 text-xl font-bold text-zinc-900">{activeGroupData.title}</h2>
              <p className="text-sm text-zinc-500">{activeGroupData.subtitle}</p>
              <div className="mt-5 border-t border-zinc-100 pt-5">
                <EmptyState label="Fitur ini belum tersedia" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
