"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Search,
  ShoppingCart,
  ChevronRight,
  X,
  MapPin,
  User,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import type { SerializedOrder } from "@/lib/actions/orders";
import { updateOrderStatus } from "@/lib/actions/orders";
import { OrderStatus } from "@prisma/client/browser";

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; next?: OrderStatus[] }
> = {
  PENDING: {
    label: "Baru",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    next: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  },
  PROCESSING: {
    label: "Diproses",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: RefreshCw,
    next: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  },
  SHIPPED: {
    label: "Dikirim",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Truck,
    next: [OrderStatus.COMPLETED],
  },
  COMPLETED: {
    label: "Selesai",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
    next: [],
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    next: [],
  },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "Belum Bayar", color: "bg-red-50 text-red-700 border-red-200" },
  PAID: { label: "Lunas", color: "bg-green-50 text-green-700 border-green-200" },
  PARTIAL: { label: "Sebagian", color: "bg-amber-50 text-amber-700 border-amber-200" },
  REFUNDED: { label: "Refund", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  GATEWAY: "Payment Gateway",
  TERM: "Termin / Tempo",
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? { label: status, color: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function OrderDetailPanel({
  order,
  onClose,
}: {
  order: SerializedOrder;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status as OrderStatus);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const cfg = STATUS_CONFIG[order.status];
  const nextStatuses = cfg?.next ?? [];

  const handleStatusUpdate = () => {
    if (selectedStatus === order.status) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, selectedStatus, trackingNumber);
      if (result.success) {
        setFeedback({ type: "success", msg: "Status berhasil diperbarui." });
        setTrackingNumber(""); // reset
      } else {
        setFeedback({ type: "error", msg: result.error ?? "Terjadi kesalahan." });
      }
    });
  };

  const createdAt = new Date(order.createdAt);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">Pesanan</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">{order.orderNumber}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate} · {formattedTime}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:text-blue-950 hover:bg-slate-100 transition-colors -mt-1 -mr-1 focus-visible:ring-2 focus-visible:ring-blue-950 focus-visible:outline-none"
          aria-label="Tutup panel detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Status row */}
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${order.type === "B2B" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
            {order.type}
          </span>
          {order.trackingNumber && (
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
              <Truck className="w-3 h-3" /> Resi: {order.trackingNumber}
            </span>
          )}
        </div>

        {/* Buyer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Pembeli</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            <p className="font-bold text-blue-950 text-sm">{order.user.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3 h-3 shrink-0" /> {order.user.email}
            </p>
            {order.user.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3 h-3 shrink-0" /> {order.user.phone}
              </p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Alamat Pengiriman</span>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <p className="font-bold text-blue-950 text-sm">{order.address.recipientName}</p>
            <p className="text-xs text-slate-500">{order.address.phone}</p>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">{order.address.fullAddress}</p>
            <p className="text-xs text-slate-500">{order.address.city}, {order.address.province} {order.address.postalCode}</p>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Item Pesanan</span>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-blue-950 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.product.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-700">
                    Rp {(item.priceAtOrder * item.qty).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-slate-400">{item.qty} {item.product.unit} × Rp {item.priceAtOrder.toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-blue-950/[0.03] border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600">Total Pesanan</span>
            <span className="text-base font-extrabold text-blue-950">
              Rp {order.totalAmount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Payment */}
        {order.payment && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Pembayaran</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Metode</span>
                <span className="font-bold text-blue-950">{PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah</span>
                <span className="font-bold text-blue-950">Rp {order.payment.amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">Status</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${
                  order.payment.status === "SUCCESS"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : order.payment.status === "FAILED"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>{order.payment.status}</span>
              </div>
              {order.payment.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dibayar</span>
                  <span className="font-semibold text-slate-700 text-xs">
                    {new Date(order.payment.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Status Footer */}
      {nextStatuses.length > 0 && (
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 bg-white">
          {feedback && (
            <div className={`mb-3 rounded-lg px-3 py-2 text-xs font-semibold ${
              feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {feedback.msg}
            </div>
          )}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Update Status</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
              >
                <SelectTrigger className="flex-1 border-slate-200 text-sm font-semibold focus:border-blue-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={order.status} disabled>
                    {STATUS_CONFIG[order.status]?.label ?? order.status} (saat ini)
                  </SelectItem>
                  {nextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s]?.label ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={isPending || selectedStatus === order.status || (selectedStatus === "SHIPPED" && !trackingNumber)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm shadow-red-600/20 px-4"
              >
                {isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
            
            {selectedStatus === "SHIPPED" && (
              <Input
                placeholder="Masukkan Nomor Resi Pengiriman"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="text-sm"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Orders Client ──────────────────────────────────────────────────────

interface OrdersClientProps {
  orders: SerializedOrder[];
  total: number;
  stats: Record<string, number>;
  currentStatus: string;
  currentType: string;
  currentQ: string;
  currentPage: number;
  pageSize: number;
}

export function OrdersClient({
  orders,
  total,
  stats,
  currentStatus,
  currentType,
  currentQ,
  currentPage,
  pageSize,
}: OrdersClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "ALL") p.delete(k);
      else p.set(k, v);
    });
    // Reset page when filter changes
    if (!("page" in overrides)) p.delete("page");
    return `${pathname}?${p.toString()}`;
  };

  const STATUS_TABS = [
    { key: "ALL", label: "Semua" },
    { key: "PENDING", label: "Baru" },
    { key: "PROCESSING", label: "Diproses" },
    { key: "SHIPPED", label: "Dikirim" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[50vh] sm:min-h-[70vh]">

        {/* ── Order List ── */}
        <div className="flex flex-col flex-1 min-w-0 w-full">
        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-slate-100 overflow-x-auto shrink-0 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedOrder(null);
                router.push(buildUrl({ status: tab.key }));
              }}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                currentStatus === tab.key
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-400 hover:text-blue-950"
              }`}
            >
              {tab.label}
              {stats[tab.key] !== undefined && stats[tab.key] > 0 && (
                <span className={`text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none ${
                  currentStatus === tab.key
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {stats[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Type Filter */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50 shrink-0">
          <form
            className="flex-1 relative"
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              router.push(buildUrl({ q }));
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              name="q"
              defaultValue={currentQ}
              placeholder="No. pesanan atau nama pembeli..."
              className="pl-8 h-8 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-900"
            />
          </form>
          <Select
            value={currentType}
            onValueChange={(v) => {
              setSelectedOrder(null);
              router.push(buildUrl({ type: v }));
            }}
          >
            <SelectTrigger className="w-24 h-8 text-xs border-slate-200 bg-slate-50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="font-semibold text-sm">Tidak ada pesanan ditemukan</p>
              <p className="text-xs">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const createdAt = new Date(order.createdAt);
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(isSelected ? null : order)}
                  className={`w-full text-left px-4 py-3.5 transition-colors group ${
                    isSelected
                      ? "bg-red-50 border-l-4 border-l-red-500"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-blue-950">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 truncate">{order.user.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}
                        {order.items.length} item
                        {" · "}
                        <span className={order.type === "B2B" ? "text-purple-600 font-bold" : "text-slate-400"}>{order.type}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-sm font-extrabold text-blue-950">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </span>
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-bold">
                      <ChevronRight className="w-3.5 h-3.5" />
                      Lihat detail
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, total)} dari {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-slate-200 font-bold"
                disabled={currentPage <= 1}
                onClick={() => router.push(buildUrl({ page: String(currentPage - 1) }))}
              >
                ← Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-slate-200 font-bold"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(buildUrl({ page: String(currentPage + 1) }))}
              >
                Selanjutnya →
              </Button>
            </div>
          </div>
        )}
      </div></div>

      {/* ── Detail Overlay ── */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-white" side="right" showCloseButton={false}>
          {selectedOrder && (
            <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
