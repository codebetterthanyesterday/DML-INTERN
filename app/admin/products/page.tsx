import { Suspense } from "react";
import Link from "next/link";
import { getAdminProducts } from "@/lib/actions/products";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ImportProductsModal } from "@/components/admin/products/ImportProductsModal";
import { Button } from "@/components/ui/button";
import { getStockAvailability } from "@/lib/utils/stock";
import { Plus, Package, Store, Factory, Archive, ListChecks, AlertTriangle, PackageX } from "lucide-react";

export const metadata = {
  title: "Kelola Produk — DML Admin",
  description: "Manajemen produk platform DML",
};

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; status?: string; availability?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { q = "", type = "ALL", status = "ALL", availability = "ALL" } = params;

  const productsRaw = await getAdminProducts(q, type, status, availability);
  const products = productsRaw.map((p) => ({
    ...p,
    price: p.price ? p.price.toNumber() : null,
  }));

  const stats = {
    total: products.length,
    retail: products.filter((p: { productType: string }) => p.productType === "RETAIL" || p.productType === "BOTH").length,
    industrial: products.filter((p: { productType: string }) => p.productType === "INDUSTRIAL" || p.productType === "BOTH").length,
    inactive: products.filter((p: { isActive: boolean }) => !p.isActive).length,
    lowStock: products.filter((p) => getStockAvailability(p) === "LOW_STOCK").length,
    outOfStock: products.filter((p) => getStockAvailability(p) === "OUT_OF_STOCK").length,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">Kelola Produk</h1>
          <p className="text-slate-600 mt-2 font-medium text-sm sm:text-base">
            Tambah, edit, dan kelola seluruh produk platform DML.
          </p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 w-full sm:w-auto shrink-0">
          <Link href="/admin/products/stock-log" className="w-full xs:w-auto">
            <Button variant="outline" className="w-full xs:w-auto gap-2 shadow-sm border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
              <ListChecks className="w-4 h-4 shrink-0" />
              <span>Log Aktivitas Stok</span>
            </Button>
          </Link>
          <ImportProductsModal />
          <Link href="/admin/products/new" className="w-full xs:w-auto">
            <Button className="w-full xs:w-auto bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 gap-2 transition-all duration-200">
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah Produk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {[
          { 
            label: "Total Produk", 
            value: stats.total, 
            icon: Package,
            gradient: "from-blue-500 to-indigo-600",
            bg: "bg-red-50",
            text: "text-red-600",
            ring: "ring-blue-100/50"
          },
          { 
            label: "Retail", 
            value: stats.retail, 
            icon: Store,
            gradient: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-50",
            text: "text-emerald-600",
            ring: "ring-emerald-100/50"
          },
          { 
            label: "Industrial", 
            value: stats.industrial, 
            icon: Factory,
            gradient: "from-orange-500 to-red-600",
            bg: "bg-orange-50",
            text: "text-orange-600",
            ring: "ring-orange-100/50"
          },
          { 
            label: "Nonaktif", 
            value: stats.inactive, 
            icon: Archive,
            gradient: "from-slate-400 to-slate-600",
            bg: "bg-slate-100",
            text: "text-slate-600",
            ring: "ring-slate-200/50"
          },
          {
            label: "Stok Menipis",
            value: stats.lowStock,
            icon: AlertTriangle,
            gradient: "from-amber-500 to-orange-600",
            bg: "bg-amber-50",
            text: "text-amber-600",
            ring: "ring-amber-100/50"
          },
          {
            label: "Stok Habis",
            value: stats.outOfStock,
            icon: PackageX,
            gradient: "from-red-500 to-rose-600",
            bg: "bg-red-50",
            text: "text-red-600",
            ring: "ring-red-100/50"
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-red-700/8 hover:-translate-y-0.5 transition-all duration-300 ease-out"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${stat.gradient} transition-opacity duration-300`} />
              
              <div className="flex items-center gap-3 sm:gap-4 relative">
                <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${stat.bg} ${stat.text} ring-1 ring-inset ${stat.ring} shadow-inner shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1 sm:mt-1.5">{stat.label}</div>
                </div>
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <ProductFilters currentQ={q} currentType={type} currentStatus={status} currentAvailability={availability} />

      {/* Table */}
      <Suspense fallback={<div className="text-slate-400 text-sm py-12 text-center font-medium">Memuat produk...</div>}>
        <ProductTable products={products} />
      </Suspense>
    </div>
  );
}
