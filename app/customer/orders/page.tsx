import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomerOrders } from "@/lib/data/customer-orders";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Riwayat Pesanan — DML",
  description: "Pantau status dan informasi pengiriman pesanan Anda.",
};

const TABS = [
  { value: "ALL", label: "Semua" },
  { value: OrderStatus.PENDING, label: "Menunggu" },
  { value: OrderStatus.PROCESSING, label: "Diproses" },
  { value: OrderStatus.SHIPPED, label: "Dikirim" },
  { value: OrderStatus.COMPLETED, label: "Selesai" },
  { value: OrderStatus.CANCELLED, label: "Dibatalkan" },
];

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  PROCESSING: { label: "Diproses", icon: Package, className: "bg-blue-50 text-blue-700 border-blue-200" },
  SHIPPED: { label: "Dikirim", icon: Truck, className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETED: { label: "Selesai", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Dibatalkan", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200" },
} satisfies Record<OrderStatus, { label: string; icon: typeof Clock; className: string }>;

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function OrderHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const currentStatus = TABS.some((tab) => tab.value === params.status) ? params.status! : "ALL";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const data = await getCustomerOrders({
    query,
    status: currentStatus === "ALL" ? undefined : currentStatus,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  if (!data) redirect(`/login?callbackUrl=${encodeURIComponent("/customer/orders")}`);

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const buildHref = (overrides: { status?: string; page?: number }) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    const status = overrides.status ?? currentStatus;
    if (status !== "ALL") next.set("status", status);
    const page = overrides.page ?? 1;
    if (page > 1) next.set("page", String(page));
    const suffix = next.toString();
    return suffix ? `/customer/orders?${suffix}` : "/customer/orders";
  };

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">Pesanan Saya</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">Riwayat Pesanan</h1>
          <p className="mt-2 text-slate-500">Pantau proses pesanan dan informasi pengiriman Anda secara real-time.</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5 space-y-4">
            <form className="relative max-w-xl" action="/customer/orders">
              {currentStatus !== "ALL" && <input type="hidden" name="status" value={currentStatus} />}
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="q"
                defaultValue={query}
                maxLength={100}
                placeholder="Cari nomor pesanan atau nama produk..."
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 focus:bg-white"
              />
            </form>

            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter status pesanan">
              {TABS.map((tab) => (
                <Link
                  key={tab.value}
                  href={buildHref({ status: tab.value })}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
                    currentStatus === tab.value
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>

          {data.orders.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-300">
                <Package className="h-10 w-10" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Pesanan tidak ditemukan</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">Coba gunakan kata kunci atau filter status yang berbeda.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.orders.map((order) => {
                const status = STATUS_CONFIG[order.status];
                const StatusIcon = status.icon;
                const firstItem = order.items[0];
                const shippingSummary = [order.courier?.trim(), order.trackingNumber?.trim()]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <article key={order.id} className="p-4 sm:p-6 transition-colors hover:bg-slate-50/80">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold", status.className)}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-700">{order.orderNumber}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-950">Rp {order.totalAmount.toLocaleString("id-ID")}</p>
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-300">
                        <Package className="h-7 w-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-extrabold text-slate-900">{firstItem?.name ?? "Pesanan DML"}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {firstItem?.qty ?? 0} barang
                          {order.items.length > 1 && ` · +${order.items.length - 1} produk lainnya`}
                        </p>
                        {order.status === OrderStatus.SHIPPED && shippingSummary && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                            <Truck className="h-3.5 w-3.5" />
                            {shippingSummary}
                          </p>
                        )}
                      </div>
                      <Link href={`/customer/orders/${order.id}`} className="shrink-0">
                        <Button className="bg-slate-950 font-bold text-white hover:bg-slate-800">
                          <span className="hidden sm:inline">Lihat Detail</span>
                          <ChevronRight className="h-4 w-4 sm:ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 sm:px-6">
              <p className="text-xs font-semibold text-slate-500">
                Halaman {data.page} dari {totalPages} · {data.total} pesanan
              </p>
              <div className="flex gap-2">
                {data.page <= 1 ? (
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildHref({ page: data.page - 1 })}>
                      <ChevronLeft className="h-4 w-4" /> Sebelumnya
                    </Link>
                  </Button>
                )}
                {data.page >= totalPages ? (
                  <Button variant="outline" size="sm" disabled>
                    Selanjutnya <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildHref({ page: data.page + 1 })}>
                      Selanjutnya <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
