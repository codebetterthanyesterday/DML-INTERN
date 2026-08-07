import prisma from "@/lib/prisma";
import { getSalesData } from "@/lib/reports/getSalesData";
import { RevenueFilters } from "@/components/superadmin/RevenueFilters";
import { RevenueReportTable, RevenueTransaction } from "@/components/superadmin/RevenueReportTable";
import { RevenueTrendChart, RevenueTrendData } from "@/components/superadmin/RevenueTrendChart";
import { ExportPDFButton } from "@/components/superadmin/ExportPDFButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export const metadata = {
  title: "Laporan Pendapatan | DML Super Admin",
};

export default async function RevenueReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Read Search Params
  const monthParam = resolvedSearchParams.month;
  const yearParam = resolvedSearchParams.year;
  const segment = resolvedSearchParams.segment || "ALL";
  const productId = resolvedSearchParams.productId || "ALL";

  // Parse Dates
  const targetYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  const targetMonth = monthParam !== undefined ? parseInt(monthParam) : undefined;

  let startDate: Date;
  let endDate: Date;

  if (targetMonth !== undefined && !isNaN(targetMonth)) {
    startDate = new Date(targetYear, targetMonth, 1);
    endDate = new Date(targetYear, targetMonth + 1, 1);
  } else {
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear + 1, 0, 1);
  }

  // Fetch Products for the Combobox
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Fetch Transactions using shared utility
  const rawTransactions = await getSalesData({ startDate, endDate, segment, productId });

  const transactions: RevenueTransaction[] = rawTransactions.map((t) => ({
    id: t.id,
    date: t.date,
    reference: t.reference,
    customerName: t.customerName,
    segment: t.segment,
    amount: t.amount,
  }));

  // Prepare chart data
  const chartDataMap = new Map<string, number>();
  if (targetMonth !== undefined && !isNaN(targetMonth)) {
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) chartDataMap.set(i.toString(), 0);
    transactions.forEach((t) => {
      const day = t.date.getDate().toString();
      chartDataMap.set(day, (chartDataMap.get(day) || 0) + t.amount);
    });
  } else {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    monthNames.forEach((m) => chartDataMap.set(m, 0));
    transactions.forEach((t) => {
      const m = monthNames[t.date.getMonth()];
      chartDataMap.set(m, (chartDataMap.get(m) || 0) + t.amount);
    });
  }

  const chartData: RevenueTrendData[] = Array.from(chartDataMap.entries()).map(([label, amount]) => ({
    label,
    amount,
  }));
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build period label for export filenames
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const periodLabel =
    targetMonth !== undefined && !isNaN(targetMonth)
      ? `${monthNames[targetMonth]} ${targetYear}`
      : `Tahun ${targetYear}`;

  const segmentLabel = segment === "ALL" ? "Semua Segmen" : segment;

  // Build Excel export URL (mirrors active filters)
  const exportParams = new URLSearchParams();
  if (monthParam) exportParams.set("month", monthParam);
  exportParams.set("year", targetYear.toString());
  if (segment !== "ALL") exportParams.set("segment", segment);
  if (productId !== "ALL") exportParams.set("productId", productId);
  exportParams.set("format", "excel");
  const excelExportUrl = `/api/export/sales?${exportParams.toString()}`;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-indigo-950">Laporan Pendapatan</h1>
        <p className="text-sm text-slate-500 mt-1">Analisis performa bisnis berdasarkan bulan, segmen, dan produk.</p>
      </div>

      <RevenueFilters
        products={products}
        currentMonth={monthParam || ""}
        currentYear={targetYear.toString()}
        currentSegment={segment}
        currentProductId={productId === "ALL" ? "" : productId}
        exportUrl={excelExportUrl}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-700">Tren Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={chartData} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full border-slate-200 shadow-sm bg-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-base font-medium text-indigo-100">Total Pendapatan (Filter)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <div className="w-16 h-16 rounded-full bg-indigo-500/50 flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold">{formatCurrency(totalRevenue)}</h2>
              <p className="text-indigo-200 text-sm mt-2 font-medium">{transactions.length} Transaksi</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-indigo-950">Rincian Transaksi</h2>
          <ExportPDFButton
            transactions={rawTransactions}
            periodLabel={periodLabel}
            segmentLabel={segmentLabel}
          />
        </div>
        <RevenueReportTable data={transactions} />
      </div>
    </div>
  );
}
