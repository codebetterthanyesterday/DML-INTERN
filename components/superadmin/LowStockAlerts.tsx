import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, PackageX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  image: string | null;
}

interface LowStockAlertsProps {
  products: LowStockProduct[];
  threshold: number;
}

export function LowStockAlerts({ products, threshold }: LowStockAlertsProps) {
  return (
    <Card className="border-red-100 shadow-sm h-full flex flex-col bg-gradient-to-b from-white to-red-50/30">
      <CardHeader className="pb-3 border-b border-red-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Peringatan Stok Tipis
            </CardTitle>
            <CardDescription className="text-red-600/70">Produk dengan stok &lt; {threshold}</CardDescription>
          </div>
          <Link href="/superadmin/products" className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors">
            Kelola Stok <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        {products.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <PackageX className="h-5 w-5 text-emerald-500" />
            </div>
            Semua stok produk dalam kondisi aman.
          </div>
        ) : (
          <div className="divide-y divide-red-50/50">
            {products.map((product) => (
              <div key={product.id} className="p-4 hover:bg-red-50/50 transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0 relative border border-slate-200">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <PackageX className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">ID: {product.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs border border-red-200 shadow-sm">
                    Sisa {product.stock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
