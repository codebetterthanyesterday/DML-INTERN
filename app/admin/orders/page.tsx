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
      value: allStats.ALL ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-950",
      iconColor: "text-blue-400",
    },
    {
      label: "Baru / Pending",
      value: allStats.PENDING ?? 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-800",
      iconColor: "text-amber-400",
    },
    {
      label: "Diproses",
      value: (allStats.PROCESSING ?? 0) + (allStats.SHIPPED ?? 0),
      icon: Package,
      color: "bg-slate-50 text-slate-700",
      iconColor: "text-slate-400",
    },
    {
      label: "Selesai",
      value: allStats.COMPLETED ?? 0,
      icon: TrendingUp,
      color: "bg-green-50 text-green-800",
      iconColor: "text-green-400",
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 ${card.color}`}
          >
            <card.icon className={`w-5 h-5 shrink-0 ${card.iconColor}`} />
            <div>
              <div className="text-2xl font-extrabold leading-none">{card.value}</div>
              <div className="text-xs font-semibold opacity-70 mt-0.5">{card.label}</div>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Kelola Pesanan</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Monitor dan update status seluruh pesanan masuk platform DML.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-16 flex flex-col items-center gap-3 text-slate-400">
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
