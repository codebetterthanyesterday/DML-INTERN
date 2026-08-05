import { Suspense } from "react";
import { getAdminOrders } from "@/lib/actions/orders";
import { OrdersClient } from "@/components/admin/orders/OrdersClient";
import { ShoppingCart, Package, Clock, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Kelola Pesanan — DML Admin",
  description: "Manajemen dan monitoring seluruh pesanan platform DML",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>;
}

const PAGE_SIZE = 20;

async function OrdersContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = params.status ?? "ALL";
  const type = params.type ?? "ALL";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { orders, total, stats } = await getAdminOrders(q, status, type, page, PAGE_SIZE);

  // Revenue stat from all orders (unfiltered)
  const { stats: allStats } = await getAdminOrders("", "ALL", "ALL", 1, 1);

  const statCards = [
    {
      label: "Total Pesanan",
      subLabel: "Semua Transaksi",
      value: allStats.ALL ?? 0,
      icon: ShoppingCart,
      accentBorder: "border-t-blue-600",
      iconBg: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Baru / Pending",
      subLabel: "Butuh Tindakan",
      value: allStats.PENDING ?? 0,
      icon: Clock,
      accentBorder: "border-t-amber-500",
      iconBg: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-100",
      hasPulse: true,
    },
    {
      label: "Diproses",
      subLabel: "Dalam Pengiriman",
      value: (allStats.PROCESSING ?? 0) + (allStats.SHIPPED ?? 0),
      icon: Package,
      accentBorder: "border-t-indigo-500",
      iconBg: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Selesai",
      subLabel: "Transaksi Sukses",
      value: allStats.COMPLETED ?? 0,
      icon: TrendingUp,
      accentBorder: "border-t-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#fbfbfb] border border-slate-200/80 ${card.accentBorder} border-t-4 p-4 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider truncate">{card.label}</p>
                <p className="text-3xl font-black text-blue-950 tracking-tight mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} transition-transform group-hover:scale-110 shrink-0`}>
                <card.icon className="w-5 h-5 shrink-0" />
              </div>
            </div>

            <div className="flex">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${card.badgeBg} flex items-center gap-1.5 w-fit`}>
                {card.hasPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
                {card.subLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <OrdersClient
        orders={orders}
        total={total}
        stats={stats}
        currentStatus={status}
        currentType={type}
        currentQ={q}
        currentPage={page}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950">Kelola Pesanan</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Monitor dan update status seluruh pesanan masuk platform DML.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-10 sm:p-16 flex flex-col items-center gap-3 text-slate-400">
            <ShoppingCart className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat pesanan...</p>
          </div>
        }
      >
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
