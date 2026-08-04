import { Suspense } from "react";
import Link from "next/link";
import { getAdminProducts } from "@/lib/actions/products";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ImportProductsModal } from "@/components/admin/products/ImportProductsModal";
import { Button } from "@/components/ui/button";
import { Plus, Package, Store, Factory, Archive } from "lucide-react";

export const metadata = {
  title: "Kelola Produk — DML Admin",
  description: "Manajemen produk platform DML",
};

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { q = "", type = "ALL", status = "ALL" } = params;

  const productsRaw = await getAdminProducts(q, type, status);
  const products = productsRaw.map((p) => ({
    ...p,
    price: p.price ? p.price.toNumber() : null,
  }));

  const stats = {
    total: products.length,
    retail: products.filter((p: { productType: string }) => p.productType === "RETAIL" || p.productType === "BOTH").length,
    industrial: products.filter((p: { productType: string }) => p.productType === "INDUSTRIAL" || p.productType === "BOTH").length,
    inactive: products.filter((p: { isActive: boolean }) => !p.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Kelola Produk</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Tambah, edit, dan kelola seluruh produk platform DML.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportProductsModal />
          <Link href="/admin/products/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 gap-2">
              <Plus className="w-4 h-4" />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Produk", 
            value: stats.total, 
            icon: Package,
            gradient: "from-blue-500 to-indigo-600",
            bg: "bg-blue-50",
            text: "text-blue-600",
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
        ].map((stat) => {
          const Icon = stat.icon;
          return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${stat.gradient} transition-opacity duration-300`} />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} ring-1 ring-inset ${stat.ring} shadow-inner shrink-0`}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-3xl font-black text-slate-800 tracking-tight leading-none truncate">{stat.value}</div>
                <div className="text-sm font-bold text-slate-500 mt-1.5 truncate">{stat.label}</div>
              </div>
            </div>
            
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        )})}
      </div>

      {/* Filters */}
      <ProductFilters currentQ={q} currentType={type} currentStatus={status} />

      {/* Table */}
      <Suspense fallback={<div className="text-slate-400 text-sm py-8 text-center">Memuat produk...</div>}>
        <ProductTable products={products} />
      </Suspense>
    </div>
  );
}
