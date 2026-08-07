import prisma from "@/lib/prisma";
import { B2BPerformanceTable, B2BCustomerData } from "@/components/superadmin/B2BPerformanceTable";
import { TopB2BChart } from "@/components/superadmin/TopB2BChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Performa Customer B2B | DML Super Admin",
};

export default async function B2BPerformancePage() {
  const users = await prisma.user.findMany({
    where: { role: 'BUSINESS' },
    include: {
      orders: {
        where: { type: 'B2B' }
      },
      quotes: {
        include: {
          invoice: true
        }
      }
    }
  });

  const b2bCustomers: B2BCustomerData[] = users.map(user => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let outstandingDebt = 0;
    const recentTransactions: B2BCustomerData['recentTransactions'] = [];

    // Proses Invoice B2B (dari Quotes)
    user.quotes.forEach(quote => {
      if (quote.invoice) {
        totalOrders += 1;
        if (quote.invoice.status === 'PAID') {
           totalRevenue += Number(quote.invoice.amount);
           recentTransactions.push({
             id: quote.invoice.id,
             date: quote.invoice.createdAt,
             amount: Number(quote.invoice.amount),
             type: 'Invoice',
             status: quote.invoice.status
           });
        } else if (quote.invoice.status === 'UNPAID' || quote.invoice.status === 'OVERDUE') {
           outstandingDebt += Number(quote.invoice.amount);
           recentTransactions.push({
             id: quote.invoice.id,
             date: quote.invoice.createdAt,
             amount: Number(quote.invoice.amount),
             type: 'Invoice',
             status: quote.invoice.status
           });
        }
      }
    });

    // Proses Direct Order B2B
    user.orders.forEach(order => {
      if (order.status !== 'CANCELLED') {
        totalOrders += 1;
        totalRevenue += Number(order.totalAmount);
        recentTransactions.push({
          id: order.id,
          date: order.createdAt,
          amount: Number(order.totalAmount),
          type: 'Order',
          status: order.status
        });
      }
    });

    return {
      id: user.id,
      companyName: user.companyName || user.name,
      picName: user.name,
      email: user.email,
      phone: user.phone || "-",
      totalOrders,
      totalRevenue,
      outstandingDebt,
      recentTransactions: recentTransactions.sort((a, b) => b.date.getTime() - a.date.getTime())
    };
  });

  const chartData = b2bCustomers.map(c => ({
    name: c.companyName,
    revenue: c.totalRevenue
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-950 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          Performa Customer B2B
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Pantau frekuensi order, total nilai transaksi, dan status piutang dari setiap klien B2B Anda untuk mengidentifikasi mitra paling strategis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Top 5 Pelanggan (Revenue)
            </CardTitle>
            <CardDescription>Berdasarkan total transaksi berhasil.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.filter(d => d.revenue > 0).length > 0 ? (
              <TopB2BChart data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-slate-50 rounded-lg border border-slate-100 text-slate-400 text-sm italic">
                Belum ada data revenue B2B.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-slate-200 bg-transparent shadow-none border-none">
          <B2BPerformanceTable data={b2bCustomers} />
        </Card>
      </div>
    </div>
  );
}
