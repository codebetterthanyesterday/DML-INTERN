import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import QuoteResponseClient from "./QuoteResponseClient";

export default async function RFQDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const quote = await prisma.quote.findUnique({
    where: { 
      id: params.id,
      userId: session.user.id
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!quote) {
    notFound();
  }

  const isQuoted = quote.status === "QUOTED";

  const statusConfig: Record<string, { label: string, className: string }> = {
    PENDING: { label: "Menunggu Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
    REVIEWED: { label: "Sedang Direview", className: "bg-blue-50 text-blue-700 border-blue-200" },
    QUOTED: { label: "Ditawarkan", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    ACCEPTED: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    REJECTED: { label: "Ditolak", className: "bg-red-50 text-red-700 border-red-200" },
  };

  const config = statusConfig[quote.status] || { label: quote.status, className: "bg-slate-50 text-slate-700" };

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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{quote.quoteNumber}</h1>
            <Badge className={`hover:bg-transparent ${config.className}`}>{config.label}</Badge>
          </div>
          <p className="text-slate-500 mt-1">
            Diajukan pada {format(new Date(quote.createdAt), "dd MMM yyyy", { locale: localeId })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rincian Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Qty: {item.qtyRequested} {item.product.unit}</p>
                    {item.notes && (
                      <div className="mt-2 text-sm text-slate-600 flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                        <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                        <p>{item.notes}</p>
                      </div>
                    )}
                  </div>
                  {isQuoted && item.quotedPrice && (
                    <div className="text-right shrink-0 bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Harga Penawaran</p>
                      <p className="font-bold text-slate-900">
                        Rp {Number(item.quotedPrice).toLocaleString("id-ID")}
                        <span className="text-sm font-normal text-slate-500"> / {item.product.unit}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tanggapan Admin</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.adminNotes ? (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700 whitespace-pre-wrap">
                  {quote.adminNotes}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-500">
                  Belum ada tanggapan dari admin.
                </div>
              )}
            </CardContent>
            
            {isQuoted && (
              <>
                <Separator />
                <CardFooter className="pt-6 flex flex-col gap-4">
                  <div className="w-full">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Respon Anda:</h4>
                    <QuoteResponseClient quoteId={quote.id} />
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
