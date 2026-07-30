"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type SummaryMetrics = {
  totalRetailSales: number;
  totalApprovedRFQValue: number;
  totalOrders: number;
  totalQuotes: number;
  topProduct: string;
  startDate: string;
  endDate: string;
};

export function ExportCSVButton({ data }: { data: SummaryMetrics }) {
  const handleExport = () => {
    const csvRows = [];
    // Headers
    csvRows.push(["Metric", "Value", "Start Date", "End Date"]);
    
    // Rows
    csvRows.push([
      "Total Penjualan Retail",
      data.totalRetailSales,
      data.startDate,
      data.endDate,
    ]);
    csvRows.push([
      "Total Nilai RFQ Disetujui",
      data.totalApprovedRFQValue,
      data.startDate,
      data.endDate,
    ]);
    csvRows.push([
      "Total Order Retail",
      data.totalOrders,
      data.startDate,
      data.endDate,
    ]);
    csvRows.push([
      "Total RFQ Disetujui",
      data.totalQuotes,
      data.startDate,
      data.endDate,
    ]);
    csvRows.push([
      "Produk Terlaris",
      data.topProduct,
      data.startDate,
      data.endDate,
    ]);

    const csvString = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `laporan_summary_${data.startDate}_to_${data.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleExport}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
    >
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  );
}
