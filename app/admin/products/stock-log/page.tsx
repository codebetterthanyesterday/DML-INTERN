import Link from "next/link";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, ClipboardCheck, ListChecks } from "lucide-react";
import {
  getStockLogs,
  getStockLogStatsToday,
  getProductsForStockPicker,
} from "@/lib/actions/stock";
import { StockLogClient } from "@/components/admin/products/stock-log/StockLogClient";
import { StockMovementModal } from "@/components/admin/products/stock-log/StockMovementModal";
import { OpnameModal } from "@/components/admin/products/stock-log/OpnameModal";
import { StockMovementType } from "@prisma/client";

export const metadata = {
  title: "Log Aktivitas Stok — DML Admin",
  description: "Pencatatan & riwayat pergerakan stok produk (masuk, keluar, opname)",
};

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export default async function StockLogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const type = (params.type ?? "ALL") as StockMovementType | "ALL";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ logs, totalPages }, stats, products] = await Promise.all([
    getStockLogs({ q, type, page, limit: 20 }),
    getStockLogStatsToday(),
    getProductsForStockPicker(),
  ]);

  const statCards = [
    {
      label: "Stok Masuk Hari Ini",
      value: stats.inCount,
      icon: ArrowDownCircle,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      ring: "ring-emerald-100/50",
    },
    {
      label: "Stok Keluar Hari Ini",
      value: stats.outCount,
      icon: ArrowUpCircle,
      bg: "bg-orange-50",
      text: "text-orange-600",
      ring: "ring-orange-100/50",
    },
    {
      label: "Opname Hari Ini",
      value: stats.opnameCount,
      icon: ClipboardCheck,
      bg: "bg-red-50",
      text: "text-red-600",
      ring: "ring-blue-100/50",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-12">
      {/* Header */}
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" /> Kembali ke Kelola Produk
        </Link>
        
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight flex items-center gap-3 mb-2 sm:mb-3">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl sm:rounded-2xl shadow-lg shadow-red-600/20">
                  <ListChecks className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Log Aktivitas Stok</span>
              </h1>
              <p className="text-slate-600 font-medium text-sm sm:text-base max-w-2xl">
                Riwayat lengkap pergerakan stok: masuk, keluar, dan hasil stock opname — diperbarui secara real-time.
              </p>
            </div>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
              <OpnameModal products={products} />
              <StockMovementModal mode="OUT" products={products} />
              <StockMovementModal mode="IN" products={products} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Premium Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 hover:border-slate-300/80 p-4 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-1 transition-all duration-300 ease-out cursor-default"
              style={{
                animation: `slideInUp 0.5s ease-out ${index * 50}ms both`,
              }}
            >
              <style>{`
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(12px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.03]" />
              </div>

              <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${stat.bg} ${stat.text} ring-1 ring-inset ${stat.ring} shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none tabular-nums">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-2 sm:mt-2.5 group-hover:text-slate-600 transition-colors duration-200">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table + realtime */}
      <StockLogClient
        logs={logs}
        currentPage={page}
        totalPages={totalPages}
        currentType={type}
        currentQ={q}
      />
    </div>
  );
}
