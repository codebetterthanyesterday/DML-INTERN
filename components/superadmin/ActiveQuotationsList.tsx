import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export interface ActiveQuotation {
  id: string;
  businessName: string;
  total: number;
  status: string;
  createdAt: Date;
}

interface ActiveQuotationsListProps {
  quotations: ActiveQuotation[];
}

export function ActiveQuotationsList({ quotations }: ActiveQuotationsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>;
      case 'REVIEW':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Ditinjau</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Disetujui</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Quotation Aktif
            </CardTitle>
            <CardDescription>Permintaan penawaran harga terbaru</CardDescription>
          </div>
          <Link href="/superadmin/quotes" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        {quotations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            Tidak ada quotation aktif saat ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotations.map((quote) => (
              <div key={quote.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-slate-800">{quote.businessName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{quote.id}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(quote.createdAt, { addSuffix: true, locale: id })}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-sm text-indigo-950">{formatCurrency(quote.total)}</p>
                  <div>{getStatusBadge(quote.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
