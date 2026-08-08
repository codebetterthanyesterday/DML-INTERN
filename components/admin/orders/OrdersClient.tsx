"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FileText,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { SerializedOrder } from "@/lib/actions/orders";
import { updateOrderStatus } from "@/lib/actions/orders";
import { OrderStatus } from "@prisma/client/browser";
import { upload } from "@vercel/blob/client";

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
    label: "Diproses / Dikemas",
    color: "bg-red-50 text-red-600 border-red-200",
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
  const [courier, setCourier] = useState(order.courier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [deliveryNoteFile, setDeliveryNoteFile] = useState<File | null>(null);
  const [uploadedDeliveryNote, setUploadedDeliveryNote] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const router = useRouter();

  const cfg = STATUS_CONFIG[order.status];
  const nextStatuses = cfg?.next ?? [];

  const handleStatusUpdate = () => {
    if (selectedStatus === order.status && selectedStatus !== OrderStatus.SHIPPED) return;

    startTransition(async () => {
      try {
        let deliveryNote = uploadedDeliveryNote;
        if (selectedStatus === OrderStatus.SHIPPED && !deliveryNote && deliveryNoteFile) {
          const blob = await upload(
            `delivery-notes/${order.orderNumber}/${deliveryNoteFile.name}`,
            deliveryNoteFile,
            {
              access: "private",
              handleUploadUrl: "/api/blob/delivery-notes",
              clientPayload: JSON.stringify({ orderId: order.id }),
            }
          );
          deliveryNote = { url: blob.url, name: deliveryNoteFile.name };
          setUploadedDeliveryNote(deliveryNote);
        }

        const result = await updateOrderStatus({
          orderId: order.id,
          status: selectedStatus,
          ...(selectedStatus === OrderStatus.SHIPPED
            ? {
                courier,
                trackingNumber,
                deliveryNoteUrl: deliveryNote?.url,
                deliveryNoteName: deliveryNote?.name,
              }
            : {}),
        });
        if (result.success) {
          toast.success(selectedStatus === OrderStatus.SHIPPED
            ? "Data pengiriman berhasil disimpan."
            : "Status pesanan berhasil diperbarui.");
          onClose();
          router.refresh();
        } else {
          toast.error(result.error ?? "Terjadi kesalahan.");
        }
      } catch (error) {
        console.error("Shipment update error:", error);
        toast.error(error instanceof Error ? error.message : "Gagal menyimpan data pengiriman.");
      }
    });
  };

  const handleDeliveryNoteChange = (file: File | undefined) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Surat jalan harus berupa PDF, JPG, atau PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran surat jalan maksimal 5 MB.");
      return;
    }
    setDeliveryNoteFile(file);
    setUploadedDeliveryNote(null);
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
          <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">{order.orderNumber}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate} · {formattedTime}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors -mt-1 -mr-1 focus-visible:ring-2 focus-visible:ring-blue-950 focus-visible:outline-none"
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

        {order.status === OrderStatus.SHIPPED && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 overflow-hidden">
            <div className="px-4 py-2.5 bg-white/80 border-b border-indigo-100 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest">Data Pengiriman</span>
            </div>
            <dl className="px-4 py-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-slate-500">Kurir</dt>
              <dd className="font-bold text-slate-950 text-right">{order.courier}</dd>
              <dt className="text-slate-500">Nomor resi</dt>
              <dd className="font-mono font-bold text-slate-950 text-right break-all">{order.trackingNumber}</dd>
              <dt className="text-slate-500">Surat jalan</dt>
              <dd className="text-right">
                {order.deliveryNoteName ? (
                  <a
                    href={`/api/orders/${order.id}/delivery-note`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    {order.deliveryNoteName}
                  </a>
                ) : (
                  <span className="font-semibold text-amber-700">Belum tersedia</span>
                )}
              </dd>
            </dl>
          </div>
        )}

        {/* Buyer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Pembeli</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            <p className="font-bold text-slate-950 text-sm">{order.user.name}</p>
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
            <p className="font-bold text-slate-950 text-sm">{order.address.recipientName}</p>
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
                  <p className="text-sm font-bold text-slate-950 truncate">{item.product.name}</p>
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
          <div className="px-4 py-3 bg-red-600/[0.03] border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600">Total Pesanan</span>
            <span className="text-base font-extrabold text-slate-950">
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
                <span className="font-bold text-slate-950">{PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah</span>
                <span className="font-bold text-slate-950">Rp {order.payment.amount.toLocaleString("id-ID")}</span>
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
                disabled={
                  isPending ||
                  (selectedStatus === order.status && selectedStatus !== OrderStatus.SHIPPED) ||
                  (selectedStatus === OrderStatus.SHIPPED &&
                    (!courier.trim() ||
                      !trackingNumber.trim() ||
                      (!deliveryNoteFile && !order.deliveryNoteName)))
                }
                className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm shadow-red-600/20 px-4"
              >
                {isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  selectedStatus === OrderStatus.SHIPPED ? "Simpan Pengiriman" : "Simpan"
                )}
              </Button>
            </div>
            
            {selectedStatus === OrderStatus.SHIPPED && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">Lengkapi data pengiriman</p>
                    <p className="text-xs text-slate-500 mt-0.5">Data ini akan langsung terlihat oleh customer.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`courier-${order.id}`} className="text-xs font-bold text-slate-700">
                    Kurir
                  </Label>
                  <Input
                    id={`courier-${order.id}`}
                    placeholder="Contoh: JNE, J&T, SiCepat"
                    value={courier}
                    onChange={(event) => setCourier(event.target.value)}
                    maxLength={100}
                    disabled={isPending}
                    className="bg-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`tracking-${order.id}`} className="text-xs font-bold text-slate-700">
                    Nomor resi
                  </Label>
                  <Input
                    id={`tracking-${order.id}`}
                    placeholder="Masukkan nomor resi pengiriman"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    maxLength={100}
                    disabled={isPending}
                    className="bg-white font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`delivery-note-${order.id}`} className="text-xs font-bold text-slate-700">
                    Surat jalan
                  </Label>
                  <label
                    htmlFor={`delivery-note-${order.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                      {deliveryNoteFile ? <FileText className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {deliveryNoteFile?.name ?? "Pilih dokumen"}
                      </p>
                      <p className="text-[11px] text-slate-400">PDF, JPG, atau PNG · Maks. 5 MB</p>
                    </div>
                  </label>
                  <input
                    id={`delivery-note-${order.id}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => handleDeliveryNoteChange(event.target.files?.[0])}
                    disabled={isPending}
                    className="sr-only"
                  />
                </div>
              </div>
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
    { key: "PROCESSING", label: "Diproses / Dikemas" },
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
                  : "border-transparent text-slate-400 hover:text-slate-950"
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
                        <span className="font-mono text-xs font-extrabold text-slate-950">
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
                      <span className="text-sm font-extrabold text-slate-950">
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
