import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, FileText, Building2, Wallet } from "lucide-react";
import { SalesChart, ChartDataItem } from "@/components/admin/SalesChart";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const [
    newOrdersToday,
    newOrdersYesterday,
    rfqPendingCount,
    businessPendingCount,
    completedOrdersThisMonth,
    completedOrdersLastMonth,
    completedInvoicesThisMonth,
    completedInvoicesLastMonth,
    recentQuotes,
    ordersForChart,
    invoicesForChart,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfYesterday, lt: startOfToday } } }),
    prisma.quote.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { businessStatus: 'PENDING' } }),
    
    // Revenue this month (B2C)
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startOfThisMonth }
      },
      select: { totalAmount: true }
    }),
    // Revenue last month (B2C)
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }
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
    // Revenue last month (B2B)
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }
      },
      select: { amount: true }
    }),

    // Recent RFQs
    prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),

    // Data for Chart (B2C) - last 6 months
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
      },
      select: { totalAmount: true, createdAt: true }
    }),

    // Data for Chart (B2B) - last 6 months
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
      },
      select: { amount: true, createdAt: true }
    }),
  ]);

  const calculateTotal = (orders: { totalAmount: any }[], invoices: { amount: any }[]) => {
    const ordersTotal = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const invoicesTotal = invoices.reduce((sum, i) => sum + Number(i.amount), 0);
    return ordersTotal + invoicesTotal;
  };

  const revenueThisMonth = calculateTotal(completedOrdersThisMonth, completedInvoicesThisMonth);
  const revenueLastMonth = calculateTotal(completedOrdersLastMonth, completedInvoicesLastMonth);

  const revenueGrowth = revenueLastMonth === 0 
    ? (revenueThisMonth > 0 ? 100 : 0) 
    : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

  const newOrdersGrowth = newOrdersToday - newOrdersYesterday;

  // Chart data formatting
  const chartDataMap = new Map<string, ChartDataItem>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = monthNames[d.getMonth()];
    chartDataMap.set(monthStr, { label: monthStr, retail: 0, industrial: 0 });
  }

  ordersForChart.forEach(o => {
    const monthStr = monthNames[o.createdAt.getMonth()];
    if (chartDataMap.has(monthStr)) {
      const data = chartDataMap.get(monthStr)!;
      data.retail += Number(o.totalAmount);
    }
  });

  invoicesForChart.forEach(i => {
    const monthStr = monthNames[i.createdAt.getMonth()];
    if (chartDataMap.has(monthStr)) {
      const data = chartDataMap.get(monthStr)!;
      data.industrial += Number(i.amount);
    }
  });

  const chartData = Array.from(chartDataMap.values());

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      notation: "compact", 
      compactDisplay: "short",
      style: 'currency', 
      currency: 'IDR',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getBadgeProps = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Menunggu Review', className: 'bg-red-50 text-red-600 hover:bg-red-100 font-bold border-red-100' };
      case 'REVIEWED':
        return { label: 'Sedang Direview', className: 'bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold border-orange-100' };
      case 'QUOTED':
        return { label: 'Menunggu Customer', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' };
      case 'ACCEPTED':
        return { label: 'Disetujui', className: 'bg-green-100 text-green-700 hover:bg-green-100 font-bold border-green-200' };
      case 'REJECTED':
        return { label: 'Ditolak', className: 'bg-slate-100 text-slate-700 border-slate-200 font-bold' };
      default:
        return { label: status, className: 'bg-slate-100 text-slate-700 border-slate-200 font-bold' };
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950">Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Ringkasan aktivitas dan performa platform DML.</p>
      </div>

      {/* Metrics Section */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg hover:shadow-blue-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Pesanan Baru</CardTitle>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform flex-none">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-950" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950">{newOrdersToday}</div>
            <p className={`text-xs font-semibold mt-1 ${newOrdersGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {newOrdersGrowth > 0 ? '+' : ''}{newOrdersGrowth} dari hari kemarin
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:shadow-red-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">RFQ Menunggu</CardTitle>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform flex-none">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950">{rfqPendingCount}</div>
            <p className="text-xs font-semibold text-red-500 mt-1">Perlu review harga</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:shadow-blue-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Akun Bisnis Pending</CardTitle>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-none">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950">{businessPendingCount}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Menunggu verifikasi</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:shadow-green-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Pendapatan</CardTitle>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform flex-none">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950">{formatCurrencyCompact(revenueThisMonth)}</div>
            <p className={`text-xs font-semibold mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Antrian RFQ Terbaru */}
        <Card className="lg:col-span-4 border-slate-200 overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl text-blue-950 font-bold">Antrian RFQ Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold">No. RFQ</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Perusahaan</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Status</TableHead>
                  <TableHead className="text-right text-slate-500 font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.length > 0 ? (
                  recentQuotes.map((quote) => {
                    const badge = getBadgeProps(quote.status);
                    return (
                      <TableRow key={quote.id} className="hover:bg-slate-50 border-slate-100">
                        <TableCell className="font-bold text-blue-950">{quote.quoteNumber}</TableCell>
                        <TableCell className="font-medium text-slate-700">{quote.user?.companyName || quote.user?.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {(quote.status === 'PENDING' || quote.status === 'REVIEWED') ? (
                            <Button size="sm" className="bg-blue-950 hover:bg-blue-900 text-white font-bold shadow-md shadow-blue-900/20" asChild>
                              <Link href={`/admin/quotes?q=${quote.quoteNumber}`}>Beri Harga</Link>
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 font-bold hover:bg-slate-50" asChild>
                              <Link href={`/admin/quotes?q=${quote.quoteNumber}`}>Lihat</Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-6 font-medium">
                      Tidak ada antrian RFQ terbaru.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3 px-4 py-3">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((quote) => {
                  const badge = getBadgeProps(quote.status);
                  return (
                    <div key={quote.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. RFQ</p>
                          <p className="text-sm font-bold text-blue-950 mt-0.5">{quote.quoteNumber}</p>
                        </div>
                        <Badge variant="secondary" className={`${badge.className} text-xs`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perusahaan</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{quote.user?.companyName || quote.user?.name}</p>
                      </div>
                      <div className="pt-2">
                        {(quote.status === 'PENDING' || quote.status === 'REVIEWED') ? (
                          <Button size="sm" className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold shadow-md shadow-blue-900/20" asChild>
                            <Link href={`/admin/quotes?q=${quote.quoteNumber}`}>Beri Harga</Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full border-slate-300 text-slate-700 font-bold hover:bg-slate-50" asChild>
                            <Link href={`/admin/quotes?q=${quote.quoteNumber}`}>Lihat</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 py-6 font-medium">
                  Tidak ada antrian RFQ terbaru.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grafik Penjualan */}
        <div className="lg:col-span-3">
          <SalesChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
