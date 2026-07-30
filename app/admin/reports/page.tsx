import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, FileText, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { SalesChart, ChartDataItem } from "@/components/admin/SalesChart";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const toDate = sp.to ? new Date(sp.to) : new Date();
  const fromDate = sp.from ? new Date(sp.from) : new Date(new Date().setDate(new Date().getDate() - 29));
  
  // Normalize dates to start and end of day
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  const [orders, invoices, allOrderItems, allQuoteItems] = await Promise.all([
    // Retail Sales (B2C)
    prisma.order.findMany({
      where: {
        type: "B2C",
        paymentStatus: "PAID",
        createdAt: { gte: fromDate, lte: toDate }
      },
      select: { totalAmount: true, createdAt: true, id: true }
    }),
    
    // Industrial Sales (B2B)
    prisma.invoice.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: fromDate, lte: toDate }
      },
      select: { amount: true, createdAt: true, quoteId: true }
    }),

    // For Top Products (Retail)
    prisma.orderItem.findMany({
      where: {
        order: {
          type: "B2C",
          paymentStatus: "PAID",
          createdAt: { gte: fromDate, lte: toDate }
        }
      },
      include: { product: true }
    }),

    // For Top Products (Industrial)
    prisma.quoteItem.findMany({
      where: {
        quote: {
          status: "ACCEPTED",
          createdAt: { gte: fromDate, lte: toDate }
        }
      },
      include: { product: true }
    })
  ]);

  const totalRetailSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalApprovedRFQValue = invoices.reduce((sum, i) => sum + Number(i.amount), 0);

  // Top Products calculation
  const productMap = new Map<string, { id: string; name: string; type: string; qty: number; revenue: number }>();

  allOrderItems.forEach(item => {
    const existing = productMap.get(item.productId) || { id: item.productId, name: item.product.name, type: "RETAIL", qty: 0, revenue: 0 };
    existing.qty += item.qty;
    existing.revenue += item.qty * Number(item.priceAtOrder);
    productMap.set(item.productId, existing);
  });

  allQuoteItems.forEach(item => {
    const existing = productMap.get(item.productId) || { id: item.productId, name: item.product.name, type: "INDUSTRIAL", qty: 0, revenue: 0 };
    existing.qty += item.qtyRequested;
    existing.revenue += item.qtyRequested * Number(item.quotedPrice || 0);
    // If it exists in both, mark as BOTH
    if (existing.type === "RETAIL") existing.type = "KEDUANYA";
    productMap.set(item.productId, existing);
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  const bestSellingProduct = topProducts.length > 0 ? topProducts[0].name : "Belum ada data";

  // Chart Data calculation
  const daysDiff = differenceInDays(toDate, fromDate);
  const isDaily = daysDiff <= 60; // Use daily if range is <= 60 days
  
  const chartDataMap = new Map<string, ChartDataItem>();

  if (isDaily) {
    for (let i = 0; i <= daysDiff; i++) {
      const d = new Date(fromDate);
      d.setDate(d.getDate() + i);
      const label = format(d, "dd MMM", { locale: id });
      chartDataMap.set(label, { label, retail: 0, industrial: 0 });
    }
  } else {
    // Monthly
    const current = new Date(fromDate);
    current.setDate(1);
    while (current <= toDate) {
      const label = format(current, "MMM yyyy", { locale: id });
      chartDataMap.set(label, { label, retail: 0, industrial: 0 });
      current.setMonth(current.getMonth() + 1);
    }
  }

  orders.forEach(o => {
    const label = format(o.createdAt, isDaily ? "dd MMM" : "MMM yyyy", { locale: id });
    if (chartDataMap.has(label)) {
      chartDataMap.get(label)!.retail += Number(o.totalAmount);
    } else {
      // In case of slight timezone mismatch
      chartDataMap.set(label, { label, retail: Number(o.totalAmount), industrial: 0 });
    }
  });

  invoices.forEach(i => {
    const label = format(i.createdAt, isDaily ? "dd MMM" : "MMM yyyy", { locale: id });
    if (chartDataMap.has(label)) {
      chartDataMap.get(label)!.industrial += Number(i.amount);
    } else {
      chartDataMap.set(label, { label, retail: 0, industrial: Number(i.amount) });
    }
  });

  const chartData = Array.from(chartDataMap.values());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const summaryMetrics = {
    totalRetailSales,
    totalApprovedRFQValue,
    totalOrders: orders.length,
    totalQuotes: invoices.length,
    topProduct: bestSellingProduct,
    startDate: format(fromDate, "yyyy-MM-dd"),
    endDate: format(toDate, "yyyy-MM-dd")
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Laporan & Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Analisis performa penjualan Retail dan Industrial.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <DateRangePicker />
          <ExportCSVButton data={summaryMetrics} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg hover:shadow-blue-900/5 transition-all border-slate-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Penjualan Retail</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-blue-950">{formatCurrency(totalRetailSales)}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">B2C Orders Paid</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-indigo-900/5 transition-all border-slate-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Nilai RFQ Disetujui</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold text-blue-950">{formatCurrency(totalApprovedRFQValue)}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">B2B Invoices Paid</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-emerald-900/5 transition-all border-slate-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">Produk Terlaris</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-extrabold text-blue-950 truncate" title={bestSellingProduct}>{bestSellingProduct}</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Berdasarkan kuantitas terjual</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 grid-cols-1">
        <SalesChart data={chartData} />
      </div>

      {/* Top 10 Products Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-blue-950 font-bold flex items-center gap-2">
            Tabel Top 10 Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center text-slate-500 font-bold uppercase text-xs tracking-wider">No</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-xs tracking-wider">Nama Produk</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-xs tracking-wider">Kategori Penjualan</TableHead>
                  <TableHead className="text-right text-slate-500 font-bold uppercase text-xs tracking-wider">Qty Terjual</TableHead>
                  <TableHead className="text-right text-slate-500 font-bold uppercase text-xs tracking-wider">Estimasi Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length > 0 ? (
                  topProducts.map((product, idx) => (
                    <TableRow key={product.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="text-center font-semibold text-slate-400">{idx + 1}</TableCell>
                      <TableCell className="font-bold text-blue-950">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          product.type === "RETAIL" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          product.type === "INDUSTRIAL" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                          "bg-purple-50 text-purple-700 border-purple-200"
                        }>
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{product.qty.toLocaleString('id-ID')} unit</TableCell>
                      <TableCell className="text-right font-extrabold text-emerald-600">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8 font-medium">
                      Tidak ada data penjualan untuk rentang waktu ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
