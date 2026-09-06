import { ReactNode } from "react";

interface PanelProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 text-sm text-zinc-400">
      {label}
    </div>
  );
}
