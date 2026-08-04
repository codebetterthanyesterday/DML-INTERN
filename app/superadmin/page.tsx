import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Building2, Wallet } from "lucide-react";
import { UserGrowthChart, UserGrowthData } from "@/components/superadmin/UserGrowthChart";
import { AuditLogTable, AuditLogData } from "@/components/superadmin/AuditLogTable";

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
    ordersThisMonth,
    invoicesThisMonth,
    recentUsers,
    rawAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { businessStatus: 'PENDING' } }),
    
    // Revenue this month (B2C)
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startOfThisMonth }
      },
      select: { totalAmount: true }
    }),
    
    // Revenue this month (B2B)
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfThisMonth }
      },
      select: { amount: true }
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
    })
  ]);

  // Calculate total revenue this month
  const b2cRevenue = ordersThisMonth.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const b2bRevenue = invoicesThisMonth.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalRevenueThisMonth = b2cRevenue + b2bRevenue;

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      notation: "compact", 
      compactDisplay: "short",
      style: 'currency', 
      currency: 'IDR',
      maximumFractionDigits: 1
    }).format(amount);
  };

  // Group user data for chart
  const chartDataMap = new Map<string, UserGrowthData>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = monthNames[d.getMonth()];
    chartDataMap.set(monthStr, { label: monthStr, customers: 0, businesses: 0 });
  }

  recentUsers.forEach(u => {
    const monthStr = monthNames[u.createdAt.getMonth()];
    if (chartDataMap.has(monthStr)) {
      const data = chartDataMap.get(monthStr)!;
      if (u.role === 'CUSTOMER') data.customers += 1;
      if (u.role === 'BUSINESS') data.businesses += 1;
    }
  });

  const chartData = Array.from(chartDataMap.values());

  // Format audit logs for the table
  const auditLogs: AuditLogData[] = rawAuditLogs.map(log => ({
    id: log.id,
    admin: { name: log.admin.name, email: log.admin.email },
    action: log.action,
    targetId: log.targetId,
    createdAt: log.createdAt
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-950">Beranda Super Admin</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Selamat datang, <span className="font-semibold text-slate-700">{session?.user?.name || "Super Admin"}</span>. 
          Pantau kesehatan platform dan aktivitas sistem secara menyeluruh.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Total Pengguna</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-indigo-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">{totalUsersCount}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Seluruh platform</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Pendapatan (Bulan Ini)</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">{formatCurrencyCompact(totalRevenueThisMonth)}</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">B2B + B2C</p>
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
            <div className="text-3xl font-extrabold text-indigo-950">{totalAdminsCount}</div>
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
            <div className="text-3xl font-extrabold text-indigo-950">{pendingBusinessCount}</div>
            <p className="text-xs font-semibold text-orange-500 mt-1">Perlu verifikasi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4 h-full">
          <UserGrowthChart data={chartData} />
        </div>
        <div className="lg:col-span-3 h-[400px]">
          <AuditLogTable logs={auditLogs} />
        </div>
      </div>
    </div>
  );
}
