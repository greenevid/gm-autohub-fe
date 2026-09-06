import { FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LaporanPage() {
  return (
    <div className="flex-1 space-y-6 px-4 py-5 sm:px-8 sm:py-6">
      <PageHeader title="Laporan" subtitle="Laporan keuangan & operasional bengkel" />
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-white text-zinc-400">
        <FileText className="h-8 w-8" />
        <p className="text-sm">Halaman laporan belum tersedia</p>
      </div>
    </div>
  );
}
