import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MessageCircle } from "lucide-react";

export default async function CustomerComplaintsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const complaints = await prisma.complaint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      order: true,
      items: {
        include: { product: true }
      },
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Menunggu Tinjauan</Badge>;
      case "REVIEWING": return <Badge variant="outline" className="bg-blue-50 text-blue-700">Sedang Ditinjau</Badge>;
      case "APPROVED": return <Badge variant="outline" className="bg-green-50 text-green-700">Disetujui</Badge>;
      case "APPROVED_FOR_RETURN": return <Badge variant="outline" className="bg-purple-50 text-purple-700">Menunggu Retur</Badge>;
      case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700">Ditolak</Badge>;
      case "RESOLVED": return <Badge variant="outline" className="bg-slate-100 text-slate-700">Selesai</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CANCELLATION": return "Pembatalan";
      case "RETURN": return "Retur Barang";
      case "REFUND": return "Pengembalian Dana";
      case "REPLACEMENT": return "Penggantian Barang";
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Komplain & Retur Saya</h1>
        <p className="text-slate-500">Pantau status pengajuan komplain dan pengembalian Anda.</p>
      </div>

      {complaints.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-3">
              <Package className="w-12 h-12 text-slate-300" />
              <p className="text-lg font-medium text-slate-900">Belum ada pengajuan</p>
              <p className="text-sm text-slate-500">
                Anda belum pernah mengajukan komplain atau retur.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-semibold">
                      Pengajuan: {getTypeBadge(complaint.type)}
                    </CardTitle>
                    {getStatusBadge(complaint.status)}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    {format(new Date(complaint.createdAt), "dd MMM yyyy", { locale: id })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Nomor Pesanan</p>
                      <Link href={`/customer/orders/${complaint.orderId}`} className="text-sm font-semibold text-blue-600 hover:underline">
                        {complaint.order.orderNumber}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Alasan</p>
                      <p className="text-sm font-medium text-slate-900">{complaint.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center md:items-end justify-start md:justify-end">
                    <Link
                      href={`/customer/complaints/${complaint.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Detail & Chat
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
