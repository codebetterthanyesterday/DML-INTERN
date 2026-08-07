import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Building2, Wallet, ShoppingCart, FileText, AlertTriangle } from "lucide-react";
import { UserGrowthChart, UserGrowthData } from "@/components/superadmin/UserGrowthChart";
import { AuditLogTable, AuditLogData } from "@/components/superadmin/AuditLogTable";
import { SalesRevenueChart, SalesRevenueData } from "@/components/superadmin/SalesRevenueChart";
import { ActiveQuotationsList, ActiveQuotation } from "@/components/superadmin/ActiveQuotationsList";
import { LowStockAlerts, LowStockProduct } from "@/components/superadmin/LowStockAlerts";

export const metadata = {
  title: "Super Admin Dashboard | DML",
  description: "Platform Utama Super Admin Duta Mitra Luhur",
};

export default async function SuperAdminDashboardPage() {
  const session = await auth();

  const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsersCount,
    totalAdminsCount,
    pendingBusinessCount,
    ordersSixMonths,
    ordersSixMonthsB2B,
    invoicesSixMonths,
    recentUsers,
    rawAuditLogs,
    activeQuotesRaw,
    allProducts
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { businessStatus: 'PENDING' } }),

    // Revenue for 6 months (B2C)
    prisma.order.findMany({
      where: {
        type: 'B2C',
        paymentStatus: 'PAID',
        createdAt: { gte: sixMonthsAgo }
      },
      select: { totalAmount: true, createdAt: true }
    }),

    // Revenue for 6 months (B2B direct orders)
    prisma.order.findMany({
      where: {
        type: 'B2B',
        paymentStatus: 'PAID',
        createdAt: { gte: sixMonthsAgo }
      },
      select: { totalAmount: true, createdAt: true }
    }),

    // Revenue for 6 months (B2B invoices)
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: sixMonthsAgo }
      },
      select: { amount: true, createdAt: true }
    }),

    // User registrations for chart
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, role: true }
    }),

    // Recent system activities
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    }),

    // Active Quotes
    prisma.quote.findMany({
      where: { status: { in: ['PENDING', 'REVIEWED', 'QUOTED'] } },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { companyName: true, name: true } },
        items: { select: { qtyRequested: true, quotedPrice: true, product: { select: { price: true } } } }
      }
    }),

    // Active Products to filter low stock
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, stock: true, lowStockThreshold: true, images: { take: 1, select: { url: true } } }
    })
  ]);

  // Filter low stock
  const lowStockRaw = allProducts
    .filter(p => p.stock < p.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  // Combine B2B orders and invoices
  const b2bTotalSales = [
    ...ordersSixMonthsB2B.map(o => ({ amount: Number(o.totalAmount), createdAt: o.createdAt })),
    ...invoicesSixMonths.map(i => ({ amount: Number(i.amount), createdAt: i.createdAt }))
  ];

  // Calculate totals for this month
  const ordersThisMonth = ordersSixMonths.filter(o => o.createdAt >= startOfThisMonth);
  const b2bSalesThisMonth = b2bTotalSales.filter(s => s.createdAt >= startOfThisMonth);

  const b2cRevenue = ordersThisMonth.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const b2bRevenue = b2bSalesThisMonth.reduce((sum, s) => sum + s.amount, 0);

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      notation: "compact",
      compactDisplay: "short",
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 1
    }).format(amount);
  };

  // Group user and sales data for charts
  const userGrowthMap = new Map<string, UserGrowthData>();
  const salesMap = new Map<string, SalesRevenueData>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = monthNames[d.getMonth()];
    userGrowthMap.set(monthStr, { label: monthStr, customers: 0, businesses: 0 });
    salesMap.set(monthStr, { label: monthStr, b2c: 0, b2b: 0 });
  }

  recentUsers.forEach(u => {
    const monthStr = monthNames[u.createdAt.getMonth()];
    if (userGrowthMap.has(monthStr)) {
      const data = userGrowthMap.get(monthStr)!;
      if (u.role === 'CUSTOMER') data.customers += 1;
      if (u.role === 'BUSINESS') data.businesses += 1;
    }
  });

  ordersSixMonths.forEach(o => {
    const monthStr = monthNames[o.createdAt.getMonth()];
    if (salesMap.has(monthStr)) {
      salesMap.get(monthStr)!.b2c += Number(o.totalAmount);
    }
  });

  b2bTotalSales.forEach(s => {
    const monthStr = monthNames[s.createdAt.getMonth()];
    if (salesMap.has(monthStr)) {
      salesMap.get(monthStr)!.b2b += s.amount;
    }
  });

  const userGrowthData = Array.from(userGrowthMap.values());
  const salesData = Array.from(salesMap.values());

  // Format audit logs
  const auditLogs: AuditLogData[] = rawAuditLogs.map(log => ({
    id: log.id,
    admin: { name: log.admin.name, email: log.admin.email },
    action: log.action,
    targetId: log.targetId,
    createdAt: log.createdAt
  }));

  // Format quotes
  const activeQuotes: ActiveQuotation[] = activeQuotesRaw.map(q => {
    const total = q.items.reduce((sum: number, item: any) => sum + (Number(item.quotedPrice || item.product?.price || 0) * item.qtyRequested), 0);
    return {
      id: q.id,
      businessName: q.user.companyName || q.user.name || 'Unknown',
      total,
      status: q.status,
      createdAt: q.createdAt
    };
  });

  // Format low stock
  const lowStockProducts: LowStockProduct[] = lowStockRaw.map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    image: p.images.length > 0 ? p.images[0].url : null
  }));

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-8 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/3"></div>

        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-indigo-200 font-medium max-w-xl">
            Selamat datang kembali, {session?.user?.name || "Super Admin"}. Berikut adalah ringkasan penjualan, performa bisnis, dan sistem real-time Anda hari ini.
          </p>
        </div>
        <div className="relative z-10 flex gap-3 text-sm font-semibold bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
          <div className="flex flex-col">
            <span className="text-indigo-200">Total B2B Bulan Ini</span>
            <span className="text-xl text-white">{formatCurrencyCompact(b2bRevenue)}</span>
          </div>
          <div className="w-px bg-white/20 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-indigo-200">Total B2C Bulan Ini</span>
            <span className="text-xl text-white">{formatCurrencyCompact(b2cRevenue)}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1 - Business Focus */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingCart className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600">Penjualan B2C</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-indigo-950">{formatCurrencyCompact(b2cRevenue)}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Order bulan ini</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600">Penjualan B2B</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-indigo-950">{formatCurrencyCompact(b2bRevenue)}</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">Invoice bulan ini</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600">Quotation Aktif</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-indigo-950">{activeQuotesRaw.length}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Menunggu respon/review</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-red-900/5 transition-all border-slate-200 group relative overflow-hidden bg-gradient-to-br from-white to-red-50/50">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600">Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-red-600">{lowStockRaw.length}</div>
            <p className="text-xs font-semibold text-red-500/80 mt-1">Produk di bawah batas (&lt; 5)</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards Row 2 - System Focus */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Total Pengguna</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-indigo-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-950">{totalUsersCount}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Seluruh platform</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Total Admin</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-950">{totalAdminsCount}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Staf aktif</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Bisnis Menunggu</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-950">{pendingBusinessCount}</div>
            <p className="text-xs font-semibold text-orange-500 mt-1">Perlu verifikasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="h-[400px]">
            <SalesRevenueChart data={salesData} />
          </div>
          <div className="flex justify-end">
            <Link 
              href="/superadmin/reports/revenue"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 h-9 px-4 py-2 gap-2"
            >
              <FileText className="w-4 h-4" />
              Lihat Laporan Lengkap
            </Link>
          </div>
        </div>
        <div className="h-[400px]">
          <UserGrowthChart data={userGrowthData} />
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px]">
          <ActiveQuotationsList quotations={activeQuotes} />
        </div>
        <div className="h-[400px]">
          <LowStockAlerts products={lowStockProducts} threshold={5} />
        </div>
      </div>

      {/* System Activity */}
      <div className="h-[400px] mt-6">
        <AuditLogTable logs={auditLogs} />
      </div>
    </div>
  );
}
