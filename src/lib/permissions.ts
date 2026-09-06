import { UserRole } from "./types";

export const MODULE_KEYS = [
  "dashboard",
  "barang-jasa",
  "penjualan",
  "pembelian",
  "manajemen-stok",
  "pelanggan",
  "supplier",
  "manajemen-karyawan",
  "laporan",
  "pengaturan",
  "manajemen-user",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

/**
 * Single source of truth for which roles can access which module.
 * Mirrored on the backend at src/config/permissions.ts — keep both in sync.
 */
export const MODULE_ROLES: Record<ModuleKey, UserRole[]> = {
  dashboard: ["superadmin", "admin", "staff"],
  "barang-jasa": ["superadmin", "admin", "staff"],
  penjualan: ["superadmin", "admin", "staff"],
  pembelian: ["superadmin", "admin", "staff"],
  "manajemen-stok": ["superadmin", "admin", "staff"],
  pelanggan: ["superadmin", "admin", "staff"],
  supplier: ["superadmin", "admin", "staff"],
  "manajemen-karyawan": ["superadmin", "admin"],
  laporan: ["superadmin", "admin"],
  pengaturan: ["superadmin", "admin"],
  "manajemen-user": ["superadmin"],
};

export function canAccess(role: UserRole, module: ModuleKey): boolean {
  return MODULE_ROLES[module].includes(role);
}

const ROUTE_MODULES: { prefix: string; module: ModuleKey }[] = [
  { prefix: "/manajemen-user", module: "manajemen-user" },
  { prefix: "/pengaturan", module: "pengaturan" },
  { prefix: "/laporan", module: "laporan" },
  { prefix: "/manajemen-karyawan", module: "manajemen-karyawan" },
  { prefix: "/supplier", module: "supplier" },
  { prefix: "/pelanggan", module: "pelanggan" },
  { prefix: "/pembelian", module: "pembelian" },
  { prefix: "/manajemen-stok", module: "manajemen-stok" },
  { prefix: "/penjualan", module: "penjualan" },
  { prefix: "/barang-jasa", module: "barang-jasa" },
];

export function moduleForPath(pathname: string): ModuleKey | null {
  if (pathname === "/") return "dashboard";
  const match = ROUTE_MODULES.find((r) => pathname.startsWith(r.prefix));
  return match?.module ?? null;
}
