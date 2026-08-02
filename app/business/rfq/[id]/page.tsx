import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default async function RFQDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  // Dummy Data for demonstration
  const rfqData = {
    id: params.id,
    date: "12 Jul 2026",
    status: "QUOTED", // PENDING | QUOTED | ACCEPTED | REJECTED
    items: [
      {
        id: 1,
        productName: "Rubber Sheet SBR (Tebal 5mm)",
        qtyRequested: 500,
        unit: "meter",
        notes: "Mohon penawaran harga grosir",
        quotedPrice: 150000,
      }
    ],
    adminNotes: "Kami bisa memberikan harga Rp150.000/meter untuk kuantitas 500 meter. Total estimasi Rp 75.000.000 (belum termasuk PPN).",
  };

  const isQuoted = rfqData.status === "QUOTED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-slate-900">
          <Link href="/business/rfq">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{rfqData.id}</h1>
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Ditawarkan</Badge>
          </div>
          <p className="text-slate-500 mt-1">Diajukan pada {rfqData.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rincian Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rfqData.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.productName}</h3>
                    <p className="text-sm text-slate-500 mt-1">Qty: {item.qtyRequested} {item.unit}</p>
                    {item.notes && <p className="text-xs text-slate-400 mt-2 italic">"{item.notes}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Harga Penawaran</p>
                    {item.quotedPrice ? (
                      <p className="font-bold text-lg text-slate-900">
                        Rp {item.quotedPrice.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">/{item.unit}</span>
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">Belum diisi</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {isQuoted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  Tanggapan Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 text-slate-700 text-sm leading-relaxed">
                  {rfqData.adminNotes}
                </div>
              </CardContent>
            </Card>
          )}

          {isQuoted && (
            <Card>
              <CardHeader>
                <CardTitle>Respon Anda (Negosiasi)</CardTitle>
                <CardDescription>Jika harga sudah sesuai, Anda bisa langsung menyetujui. Atau kirim pesan untuk negosiasi ulang.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Ketik pesan balasan untuk admin jika ingin negosiasi ulang..." 
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 justify-end">
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-2" />
                  Tolak Penawaran
                </Button>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Pesan Nego
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Setujui & Lanjut Invoice
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-slate-300"></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">RFQ Dibuat</p>
                  <p className="text-xs text-slate-400">12 Jul 2026, 10:00</p>
                </div>
              </div>
              <div className="w-0.5 h-4 bg-slate-200 ml-1 mt-[-12px]"></div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Admin Menawarkan Harga</p>
                  <p className="text-xs text-slate-500">13 Jul 2026, 14:30</p>
                </div>
              </div>
              <div className="w-0.5 h-4 bg-slate-200 ml-1 mt-[-12px]"></div>
              <div className="flex items-start gap-3 opacity-50">
                <div className="mt-0.5 h-2 w-2 rounded-full border-2 border-slate-300"></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Disetujui / Invoice Terbit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
