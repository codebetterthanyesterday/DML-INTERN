import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Package,
  Receipt,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCustomerOrder } from "@/lib/data/customer-orders";
import { cn } from "@/lib/utils";
import { CopyTrackingButton } from "./copy-tracking-button";

const STEPS = [
  { status: OrderStatus.PENDING, label: "Pesanan dibuat", icon: Clock },
  { status: OrderStatus.PROCESSING, label: "Sedang diproses", icon: Package },
  { status: OrderStatus.SHIPPED, label: "Dalam pengiriman", icon: Truck },
  { status: OrderStatus.COMPLETED, label: "Pesanan selesai", icon: CheckCircle2 },
];

const PAYMENT_METHODS: Record<string, string> = {
  GATEWAY: "Payment Gateway",
  BANK_TRANSFER: "Transfer Bank",
  TERM: "Termin / Tempo",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCustomerOrder(id);
  if (!result.authenticated) redirect(`/login?callbackUrl=${encodeURIComponent(`/customer/orders/${id}`)}`);
  if (!result.order) notFound();

  const order = result.order;
  const activeStep = STEPS.findIndex((step) => step.status === order.status);
  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.priceAtOrder, 0);
  const isCancelled = order.status === OrderStatus.CANCELLED;
  const shippingLabel = [order.courier, order.shippingService].filter(Boolean).join(" · ");

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-7 flex items-start gap-3">
          <Button variant="outline" size="icon" className="mt-1 rounded-full bg-white" asChild>
            <Link href="/customer/orders" aria-label="Kembali ke riwayat pesanan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">Detail Pesanan</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Dibuat {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {isCancelled ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-extrabold">Pesanan dibatalkan</p>
              <p className="mt-1 text-sm text-red-700">Pesanan ini tidak akan diproses lebih lanjut.</p>
            </div>
          </div>
        ) : (
          <Card className="mb-6 overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg">Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-4">
                {STEPS.map((step, index) => {
                  const complete = index <= activeStep;
                  const active = index === activeStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="relative flex items-center gap-3 sm:flex-col sm:text-center">
                      {index > 0 && (
                        <div className={cn("absolute right-1/2 top-5 hidden h-1 w-full sm:block", complete ? "bg-indigo-600" : "bg-slate-200")} />
                      )}
                      <div className={cn(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                        complete ? "border-indigo-600 text-indigo-600" : "border-slate-200 text-slate-300",
                        active && "ring-4 ring-indigo-100"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className={cn("relative z-10 text-sm font-bold", complete ? "text-slate-900" : "text-slate-400")}>{step.label}</p>
                    </div>
                  );
                })}
              </div>

              {order.status === OrderStatus.SHIPPED && (
                <div className="mt-7 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Dikirim melalui</p>
                        <p className="mt-0.5 font-extrabold text-slate-950">{shippingLabel || "Kurir DML"}</p>
                        {order.shippedAt && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {new Date(order.shippedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        )}
                      </div>
                    </div>
                    {order.trackingNumber && <CopyTrackingButton trackingNumber={order.trackingNumber} />}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-slate-500" /> Produk Dipesan
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 p-0">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 sm:p-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-300">
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900">{item.product.name}</p>
                      <p className="mt-1 font-mono text-xs text-slate-400">{item.product.sku}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.qty} {item.product.unit} × Rp {item.priceAtOrder.toLocaleString("id-ID")}</p>
                    </div>
                    <p className="shrink-0 font-extrabold text-slate-900">Rp {(item.qty * item.priceAtOrder).toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5 text-slate-500" /> Rincian Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal produk</span><span className="font-semibold">Rp {subtotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Ongkos kirim</span><span className="font-semibold">Rp {order.shippingFee.toLocaleString("id-ID")}</span></div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700"><span>Diskon</span><span className="font-semibold">- Rp {order.discountAmount.toLocaleString("id-ID")}</span></div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Total belanja</span>
                  <span className="text-xl font-black text-slate-950">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-slate-500" /> Alamat Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm">
                <p className="font-extrabold text-slate-900">{order.address.recipientName}</p>
                <p className="mt-1 text-slate-500">{order.address.phone}</p>
                <p className="mt-3 leading-relaxed text-slate-600">
                  {order.address.fullAddress}, {order.address.city}, {order.address.province} {order.address.postalCode}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-slate-500" /> Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-sm">
                <p className="font-bold text-slate-900">{PAYMENT_METHODS[order.payment?.method ?? ""] ?? "Belum tersedia"}</p>
                <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                  {order.paymentStatus === "PAID" ? "Lunas" : order.paymentStatus === "UNPAID" ? "Belum dibayar" : order.paymentStatus}
                </p>
              </CardContent>
            </Card>

            {order.deliveryNoteName && (
              <a
                href={`/api/orders/${order.id}/delivery-note`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900 transition-colors hover:bg-indigo-100"
              >
                <div className="rounded-xl bg-white p-2.5 text-indigo-600"><FileText className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Surat jalan</p>
                  <p className="truncate text-sm font-extrabold">{order.deliveryNoteName}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
