import clsx from "clsx";
import { CheckCircle2, Clock, PackageSearch, XCircle } from "lucide-react";
import { StatusServis } from "@/lib/types";

const STATUS_CONFIG: Record<StatusServis, { label: string; className: string; icon: typeof Clock }> = {
  antrian: { label: "Antrian", className: "bg-zinc-100 text-zinc-600", icon: Clock },
  dikerjakan: { label: "Dikerjakan", className: "bg-amber-50 text-amber-600", icon: Clock },
  menunggu_sparepart: {
    label: "Menunggu Sparepart",
    className: "bg-orange-50 text-orange-600",
    icon: PackageSearch,
  },
  selesai: { label: "Selesai", className: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
  dibatalkan: { label: "Dibatalkan", className: "bg-red-50 text-red-500", icon: XCircle },
};

export function StatusBadge({ status }: { status: StatusServis }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
