import { type LucideIcon } from "lucide-react";
import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  accent: "green" | "amber" | "violet" | "blue";
}

const ACCENT: Record<KpiCardProps["accent"], { text: string; bg: string; value: string }> = {
  green: { text: "text-green-600", bg: "bg-green-50", value: "text-green-600" },
  amber: { text: "text-amber-600", bg: "bg-amber-50", value: "text-amber-600" },
  violet: { text: "text-violet-600", bg: "bg-violet-50", value: "text-violet-600" },
  blue: { text: "text-blue-600", bg: "bg-blue-50", value: "text-blue-600" },
};

export function KpiCard({ label, value, hint, icon: Icon, accent }: KpiCardProps) {
  const colors = ACCENT[accent];
  return (
    <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <span className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", colors.bg)}>
          <Icon className={clsx("h-4 w-4", colors.text)} />
        </span>
      </div>
      <p className={clsx("mt-3 text-2xl font-bold", colors.value)}>{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}
