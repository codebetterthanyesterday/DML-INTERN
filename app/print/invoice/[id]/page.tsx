import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import PrintTrigger from "./PrintTrigger";
import { Building2 } from "lucide-react";

export default async function PrintInvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { 
      id: params.id,
    },
    include: {
      quote: {
        include: {
          user: true,
          items: {
            include: { product: true }
          }
        }
      }
    }
  });

  if (!invoice || invoice.quote.userId !== session.user.id) {
    notFound();
  }

  const user = invoice.quote.user;
  const subtotal = Number(invoice.amount);
  const tax = subtotal * 0.11; // Assuming 11% PPN is included or calculated. For this mock, we'll just say it's Included or flat.
  // Actually, we set amount = sum(quotedPrice * qty). So if it's already total, we just display it.

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-8 print:p-0">
      <PrintTrigger />
      
      <div className="max-w-4xl mx-auto border border-slate-200 print:border-none p-10 print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-blue-900">PT DUTA MITRA LUHUR</h1>
              <p className="text-sm text-slate-500 font-medium">Karet & Spons Industrial</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-2">INVOICE</h2>
            <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-sm text-slate-500">Ref RFQ: {invoice.quote.quoteNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tagihan Kepada:</h3>
            <p className="font-bold text-slate-900 text-lg mb-1">{user.companyName || user.name}</p>
            <p className="text-slate-600 text-sm">UP: {user.name}</p>
            {user.npwp && <p className="text-slate-600 text-sm">NPWP: {user.npwp}</p>}
            <p className="text-slate-600 text-sm">{user.phone || "-"}</p>
            <p className="text-slate-600 text-sm mt-1">{user.email}</p>
          </div>

          {/* Details */}
          <div className="text-right space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Terbit</h3>
              <p className="font-medium text-slate-900">
                {format(new Date(invoice.createdAt), "dd MMMM yyyy", { locale: localeId })}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jatuh Tempo</h3>
              <p className="font-medium text-red-600">
                {format(new Date(invoice.dueDate), "dd MMMM yyyy", { locale: localeId })}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Pembayaran</h3>
              <p className={`font-bold uppercase ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-3 text-sm font-bold text-slate-900">No.</th>
                <th className="py-3 text-sm font-bold text-slate-900">Deskripsi Produk</th>
                <th className="py-3 text-sm font-bold text-slate-900 text-right">Kuantitas</th>
                <th className="py-3 text-sm font-bold text-slate-900 text-right">Harga Satuan</th>
                <th className="py-3 text-sm font-bold text-slate-900 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.quote.items.map((item, index) => {
                const price = item.quotedPrice ? Number(item.quotedPrice) : 0;
                const total = price * item.qtyRequested;
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900">{item.product.name}</p>
                      {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-4 text-sm text-slate-600 text-right">{item.qtyRequested} {item.product.unit}</td>
                    <td className="py-4 text-sm text-slate-600 text-right">Rp {price.toLocaleString("id-ID")}</td>
                    <td className="py-4 text-sm font-semibold text-slate-900 text-right">Rp {total.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-slate-900 font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-medium">PPN (11%)</span>
              <span className="text-slate-900 font-medium">Termasuk</span>
            </div>
            <div className="flex justify-between text-lg font-black text-blue-900 pt-1">
              <span>Total Tagihan</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Footer / Payment Info */}
        <div className="grid grid-cols-2 gap-12 border-t-2 border-slate-900 pt-8 mt-auto">
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase">Instruksi Pembayaran</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pembayaran dapat dilakukan melalui Transfer Bank ke rekening berikut:<br/>
              <strong>BCA: 1234567890</strong><br/>
              A.N. PT Duta Mitra Luhur<br/><br/>
              Harap cantumkan Nomor Invoice pada berita acara transfer.
            </p>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-slate-900 mb-8 text-sm uppercase">Hormat Kami,</h4>
            <p className="text-sm text-slate-600 font-semibold border-b border-slate-300 inline-block pb-1 px-4">
              Finance Department
            </p>
            <p className="text-xs text-slate-500 mt-2">PT Duta Mitra Luhur</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
