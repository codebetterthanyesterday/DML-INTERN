"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as XLSX from "xlsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardCheck,
  Radio,
  WifiOff,
  Download,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

export interface StockLogRow {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT" | "OPNAME";
  reason: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  note: string | null;
  createdAt: string | Date;
  product: { id: string; name: string; sku: string; unit: string };
  admin: { id: string; name: string };
}

const REASON_LABELS: Record<string, string> = {
  PURCHASE: "Pembelian / Restock",
  RETURN_IN: "Retur dari Pelanggan",
  SALE: "Terjual",
  DAMAGED: "Rusak / Kadaluarsa",
  ADJUSTMENT: "Koreksi Manual",
  OPNAME_CORRECTION: "Koreksi Opname",
};

const TYPE_META = {
  STOCK_IN: { label: "Stok Masuk", icon: ArrowDownCircle, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  STOCK_OUT: { label: "Stok Keluar", icon: ArrowUpCircle, tone: "bg-orange-50 text-orange-700 border-orange-200" },
  OPNAME: { label: "Opname", icon: ClipboardCheck, tone: "bg-red-50 text-red-600 border-red-200" },
} as const;

function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface StockLogClientProps {
  logs: StockLogRow[];
  currentPage: number;
  totalPages: number;
  currentType: string;
  currentQ: string;
}

export function StockLogClient({ logs, currentPage, totalPages, currentType, currentQ }: StockLogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribes to the server-sent stock_log_changes stream (backed by
  // Postgres LISTEN/NOTIFY, see the stock-logs/stream route) and refreshes
  // this page's server data whenever a new stock movement is recorded —
  // by any admin, from any tab — without polling.
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      es = new EventSource("/api/admin/stock-logs/stream");

      es.addEventListener("connected", () => setLiveStatus("live"));

      es.addEventListener("stock_log", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          const meta = TYPE_META[data.type as keyof typeof TYPE_META];
          toast.success(`${meta?.label ?? "Aktivitas stok"} baru tercatat`, { id: `stock-log-${data.id}` });
        } catch {
          /* ignore malformed payload, refresh still happens below */
        }

        // Debounce: multiple rapid movements (e.g. bulk opname) should
        // trigger a single refresh instead of one per event.
        if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
        refreshTimeout.current = setTimeout(() => router.refresh(), 400);
      });

      es.onerror = () => {
        if (cancelled) return;
        setLiveStatus("reconnecting");
        es?.close();
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "ALL") p.delete(k);
      else p.set(k, v);
    });
    return `${pathname}?${p.toString()}`;
  };

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error("Tidak ada data untuk diekspor pada halaman ini.");
      return;
    }
    const rows = logs.map((log) => ({
      Tanggal: formatDateTime(log.createdAt),
      Tipe: TYPE_META[log.type].label,
      Produk: log.product.name,
      SKU: log.product.sku,
      Alasan: REASON_LABELS[log.reason] ?? log.reason,
      Perubahan: log.quantityChange,
      "Stok Sebelum": log.stockBefore,
      "Stok Sesudah": log.stockAfter,
      Admin: log.admin.name,
      Catatan: log.note ?? "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Aktivitas Stok");
    XLSX.writeFile(workbook, `log-aktivitas-stok-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Filters + live indicator */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 flex-1 min-w-0">
          <form
            className="relative w-full sm:max-w-xs flex-shrink-0"
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              router.push(buildUrl({ q, page: "1" }));
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              name="q"
              defaultValue={currentQ}
              placeholder="Cari produk atau SKU..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200/80 rounded-lg sm:rounded-xl text-sm sm:text-base focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              autoComplete="off"
            />
          </form>

          <Select value={currentType} onValueChange={(v) => router.push(buildUrl({ type: v, page: "1" }))}>
            <SelectTrigger className="w-full xs:w-[160px] sm:w-[180px] bg-white border border-slate-200/80 font-semibold text-slate-700 rounded-lg sm:rounded-xl py-2.5 sm:py-3 hover:border-slate-300 transition-colors duration-200">
              <SelectValue placeholder="Tipe Aktivitas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              <SelectItem value="STOCK_IN">Stok Masuk</SelectItem>
              <SelectItem value="STOCK_OUT">Stok Keluar</SelectItem>
              <SelectItem value="OPNAME">Opname</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-xs font-semibold border transition-all duration-300",
              liveStatus === "live" && "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-200/50",
              liveStatus === "connecting" && "bg-slate-100 text-slate-500 border-slate-200",
              liveStatus === "reconnecting" && "bg-amber-50 text-amber-700 border-amber-200/80"
            )}
            title="Status koneksi real-time"
          >
            {liveStatus === "live" ? <Radio className="w-2.5 h-2.5 animate-pulse" /> : <WifiOff className="w-2.5 h-2.5" />}
            <span className="hidden sm:inline">{liveStatus === "live" ? "Live" : liveStatus === "connecting" ? "Menghubungkan..." : "Menyambung ulang..."}</span>
            <span className="sm:hidden">{liveStatus === "live" ? "Live" : "..."}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport} 
            className="gap-1.5 bg-white border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 rounded-lg sm:rounded-lg py-2.5 sm:py-3 text-xs sm:text-sm"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Ekspor</span>
            <span className="sm:hidden">Ekspor</span>
          </Button>
        </div>
      </div>

      {/* Table - Premium scrollable card */}
      <div className="rounded-lg sm:rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-50/60 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-50/60 border-b border-slate-200/60">
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4">Waktu</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4">Tipe</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4">Produk</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4">Alasan</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 text-right">Perubahan</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 text-right">Stok (Sebelum → Sesudah)</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4">Admin</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4">Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 sm:py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                        <span className="text-sm sm:text-base">Belum ada aktivitas stok yang tercatat.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, idx) => {
                    const meta = TYPE_META[log.type];
                    const Icon = meta.icon;
                    return (
                      <TableRow 
                        key={log.id} 
                        className="border-b border-slate-100/60 hover:bg-slate-50/40 transition-colors duration-150 group"
                        style={{
                          animation: `fadeIn 0.3s ease-out ${idx * 20}ms both`,
                        }}
                      >
                        <style>{`
                          @keyframes fadeIn {
                            from {
                              opacity: 0;
                            }
                            to {
                              opacity: 1;
                            }
                          }
                        `}</style>
                        <TableCell className="whitespace-nowrap text-xs sm:text-sm text-slate-600 font-medium px-3 sm:px-4 py-3 sm:py-4">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                          <Badge 
                            variant="outline" 
                            className={cn("gap-1.5 font-semibold text-xs sm:text-sm py-1 px-2 sm:px-2.5 inline-flex shrink-0 group-hover:shadow-md transition-all duration-200", meta.tone)}
                          >
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                          <div className="font-semibold text-slate-800 text-sm sm:text-base">{log.product.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{log.product.sku}</div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-600 px-3 sm:px-4 py-3 sm:py-4">
                          {REASON_LABELS[log.reason] ?? log.reason}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-bold whitespace-nowrap px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm",
                            log.quantityChange > 0 ? "text-emerald-600" : log.quantityChange < 0 ? "text-red-600" : "text-slate-500"
                          )}
                        >
                          {log.quantityChange > 0 ? "+" : ""}
                          {log.quantityChange} {log.product.unit}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                          {log.stockBefore} → <span className="font-semibold text-slate-800">{log.stockAfter}</span>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-600 px-3 sm:px-4 py-3 sm:py-4">{log.admin.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-500 max-w-[150px] sm:max-w-[200px] truncate px-3 sm:px-4 py-3 sm:py-4" title={log.note ?? ""}>
                          {log.note ?? "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-4 p-3 sm:p-4 border-t border-slate-100/60 bg-gradient-to-r from-slate-50/50 to-slate-50/30">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span>
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(buildUrl({ page: String(currentPage - 1) }))}
                disabled={currentPage <= 1}
                className="bg-white border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg text-xs sm:text-sm gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> 
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="sm:hidden">Sebelumnya</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(buildUrl({ page: String(currentPage + 1) }))}
                disabled={currentPage >= totalPages}
                className="bg-white border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg text-xs sm:text-sm gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <span className="sm:hidden">Selanjutnya</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
