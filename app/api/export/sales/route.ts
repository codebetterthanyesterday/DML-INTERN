import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSalesData } from "@/lib/reports/getSalesData";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const segment = searchParams.get("segment") || "ALL";
  const productId = searchParams.get("productId") || "ALL";
  const format = searchParams.get("format") || "excel";

  const targetYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  const targetMonth = monthParam !== null ? parseInt(monthParam) : undefined;

  let startDate: Date;
  let endDate: Date;

  if (targetMonth !== undefined && !isNaN(targetMonth)) {
    startDate = new Date(targetYear, targetMonth, 1);
    endDate = new Date(targetYear, targetMonth + 1, 1);
  } else {
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear + 1, 0, 1);
  }

  const transactions = await getSalesData({ startDate, endDate, segment, productId });

  if (format !== "excel") {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  // ---- Build Excel Workbook ----
  const wb = XLSX.utils.book_new();
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const b2cTotal = transactions.filter((t) => t.segment === "B2C").reduce((s, t) => s + t.amount, 0);
  const b2bTotal = transactions.filter((t) => t.segment === "B2B").reduce((s, t) => s + t.amount, 0);
  const b2cCount = transactions.filter((t) => t.segment === "B2C").length;
  const b2bCount = transactions.filter((t) => t.segment === "B2B").length;

  const periodLabel =
    targetMonth !== undefined && !isNaN(targetMonth)
      ? `${new Date(targetYear, targetMonth).toLocaleString("id-ID", { month: "long", year: "numeric" })}`
      : `Tahun ${targetYear}`;

  // Sheet 1: Summary
  const summaryData = [
    ["PT. DML - Laporan Penjualan"],
    [`Periode: ${periodLabel}`],
    [`Segmen: ${segment}`],
    [`Tanggal Ekspor: ${new Date().toLocaleString("id-ID")}`],
    [],
    ["RINGKASAN KINERJA"],
    ["Metrik", "Nilai"],
    ["Total Pendapatan", formatCurrency(totalRevenue)],
    ["Jumlah Transaksi", transactions.length],
    [],
    ["BREAKDOWN SEGMEN"],
    ["Segmen", "Transaksi", "Pendapatan"],
    ["B2C (Retail)", b2cCount, formatCurrency(b2cTotal)],
    ["B2B (Korporat)", b2bCount, formatCurrency(b2bTotal)],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  // Sheet 2: Detail Transactions
  const detailHeader = ["No.", "Tanggal", "Nomor Referensi", "Customer", "Segmen", "Nominal (Rp)"];
  const detailRows = transactions.map((t, i) => [
    i + 1,
    new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(t.date)),
    t.reference,
    t.customerName,
    t.segment,
    t.amount,
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows]);
  wsDetail["!cols"] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 22 },
    { wch: 30 },
    { wch: 10 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Transaksi");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const fileName = `DML_Laporan_Penjualan_${periodLabel.replace(/\s/g, "_")}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
