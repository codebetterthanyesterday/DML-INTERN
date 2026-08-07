"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

export interface ExportTransaction {
  id: string;
  date: Date;
  reference: string;
  customerName: string;
  segment: "B2C" | "B2B";
  amount: number;
}

interface ExportPDFButtonProps {
  transactions: ExportTransaction[];
  periodLabel: string;
  segmentLabel: string;
}



export function ExportPDFButton({ transactions, periodLabel, segmentLabel }: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
      new Date(date)
    );

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      // Dynamic import to avoid SSR issues
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // ---- HEADER BLOCK ----
      doc.setFillColor(55, 48, 163); // indigo-700
      doc.rect(0, 0, pageWidth, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("PT. DUTA MITRA LUHUR", 14, 14);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Laporan Penjualan — Export Resmi", 14, 22);

      doc.setFontSize(9);
      doc.setTextColor(199, 210, 254); // indigo-200
      doc.text(`Periode: ${periodLabel}   |   Segmen: ${segmentLabel}   |   Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, 31);

      // ---- KPI SUMMARY BOXES ----
      const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
      const b2cTotal = transactions.filter((t) => t.segment === "B2C").reduce((s, t) => s + t.amount, 0);
      const b2bTotal = transactions.filter((t) => t.segment === "B2B").reduce((s, t) => s + t.amount, 0);

      const kpis = [
        { label: "Total Pendapatan", value: formatCurrency(totalRevenue), color: [55, 48, 163] as [number, number, number] },
        { label: "Total Transaksi", value: `${transactions.length} Transaksi`, color: [16, 185, 129] as [number, number, number] },
        { label: "B2C (Retail)", value: formatCurrency(b2cTotal), color: [245, 158, 11] as [number, number, number] },
        { label: "B2B (Korporat)", value: formatCurrency(b2bTotal), color: [14, 165, 233] as [number, number, number] },
      ];

      const boxWidth = (pageWidth - 28 - 9) / 4;
      kpis.forEach((kpi, i) => {
        const x = 14 + i * (boxWidth + 3);
        const y = 44;
        doc.setFillColor(...kpi.color);
        doc.roundedRect(x, y, boxWidth, 20, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(kpi.label.toUpperCase(), x + 4, y + 6);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(kpi.value, x + 4, y + 14, { maxWidth: boxWidth - 8 });
      });

      // ---- TRANSACTIONS TABLE ----
      doc.setTextColor(30, 30, 60);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Rincian Transaksi", 14, 74);

      const tableBody = transactions.map((t, i) => [
        i + 1,
        formatDate(t.date),
        t.reference,
        t.customerName,
        t.segment,
        formatCurrency(t.amount),
      ]);

      autoTable(doc, {
        startY: 78,
        head: [["#", "Tanggal", "No. Referensi", "Customer", "Segmen", "Nominal (Rp)"]],
        body: tableBody,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [55, 48, 163],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 28 },
          2: { cellWidth: 38 },
          3: { cellWidth: 60 },
          4: { halign: "center", cellWidth: 22 },
          5: { halign: "right", cellWidth: 40 },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawPage: (data: any) => {
          // Footer on each page
          const pageNum = data.pageNumber;
          const pageCount = doc.internal.pages.length - 1;
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
          doc.text(
            `PT. DUTA MITRA LUHUR — Dokumen Konfidensial — Halaman ${pageNum} dari ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 6,
            { align: "center" }
          );
        },
      });

      doc.save(`DML_Laporan_Penjualan_${periodLabel.replace(/\s/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
      disabled={loading || transactions.length === 0}
      className="gap-2 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
      {loading ? "Membuat PDF..." : "Export PDF"}
    </Button>
  );
}
