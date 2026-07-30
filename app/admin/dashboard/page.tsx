import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, FileText, Building2, Wallet } from "lucide-react";
import { SalesChart } from "@/components/admin/SalesChart";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Ringkasan aktivitas dan performa platform DML.</p>
      </div>

      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg hover:shadow-blue-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Pesanan Baru</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-4 w-4 text-blue-950" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-950">12</div>
            <p className="text-xs font-semibold text-green-600 mt-1">+2 dari hari kemarin</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:shadow-red-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">RFQ Menunggu</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-950">5</div>
            <p className="text-xs font-semibold text-red-500 mt-1">Perlu review harga</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:shadow-blue-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Akun Bisnis Pending</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-950">3</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Menunggu verifikasi</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:shadow-green-900/5 transition-all border-slate-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Pendapatan Bulan Ini</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-950">Rp 124.5M</div>
            <p className="text-xs font-semibold text-green-600 mt-1">+15% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Antrian RFQ Terbaru */}
        <Card className="lg:col-span-4 border-slate-200 min-w-0">
          <CardHeader>
            <CardTitle className="text-blue-950 font-bold">Antrian RFQ Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold">No. RFQ</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Perusahaan</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Status</TableHead>
                  <TableHead className="text-right text-slate-500 font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-slate-50 border-slate-100">
                  <TableCell className="font-bold text-blue-950">RFQ-0003</TableCell>
                  <TableCell className="font-medium text-slate-700">PT Sumber Jaya</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 font-bold border-red-100">
                      Menunggu Review
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-blue-950 hover:bg-blue-900 text-white font-bold shadow-md shadow-blue-900/20">Beri Harga</Button>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-slate-50 border-slate-100">
                  <TableCell className="font-bold text-blue-950">RFQ-0004</TableCell>
                  <TableCell className="font-medium text-slate-700">CV Maju Bersama</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 font-bold border-red-100">
                      Menunggu Review
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-blue-950 hover:bg-blue-900 text-white font-bold shadow-md shadow-blue-900/20">Beri Harga</Button>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-slate-50 border-slate-100">
                  <TableCell className="font-bold text-blue-950">RFQ-0002</TableCell>
                  <TableCell className="font-medium text-slate-700">PT Industri Global</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">
                      Menunggu Customer
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 font-bold hover:bg-slate-50">Lihat</Button>
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-slate-50 border-slate-100">
                  <TableCell className="font-bold text-blue-950">RFQ-0001</TableCell>
                  <TableCell className="font-medium text-slate-700">PT Teknik Utama</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-bold border-green-200">
                      Disetujui
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 font-bold hover:bg-slate-50">Lihat</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Grafik Penjualan */}
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
      </div>
    </div>
  );
}
