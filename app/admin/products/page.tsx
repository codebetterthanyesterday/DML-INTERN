import { Suspense } from "react";
import Link from "next/link";
import { getAdminProducts } from "@/lib/actions/products";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Search } from "lucide-react";

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
        <Link href="/admin/products/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 gap-2">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Produk", value: stats.total, color: "bg-blue-50 text-blue-950" },
          { label: "Retail", value: stats.retail, color: "bg-slate-50 text-slate-700" },
          { label: "Industrial", value: stats.industrial, color: "bg-red-50 text-red-700" },
          { label: "Nonaktif", value: stats.inactive, color: "bg-orange-50 text-orange-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 ${stat.color}`}
          >
            <Package className="w-4 h-4 shrink-0 opacity-70" />
            <div>
              <div className="text-xl font-extrabold leading-none">{stat.value}</div>
              <div className="text-xs font-semibold opacity-70 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 relative max-w-md" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Cari nama produk atau SKU..."
            className="pl-9 bg-white border-slate-200 focus:border-blue-900"
          />
          {/* Preserve other params */}
          {type !== "ALL" && <input type="hidden" name="type" value={type} />}
          {status !== "ALL" && <input type="hidden" name="status" value={status} />}
        </form>
        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          {(["ALL", "RETAIL", "INDUSTRIAL", "BOTH"] as const).map((t) => (
            <Link
              key={t}
              href={`/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), type: t, ...(status !== "ALL" ? { status } : {}) }).toString()}`}
            >
              <Badge
                variant="outline"
                className={`cursor-pointer font-bold text-xs px-3 py-1.5 transition-colors ${
                  type === t
                    ? "bg-blue-950 text-white border-blue-950 hover:bg-blue-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t === "ALL" ? "Semua Tipe" : t === "BOTH" ? "Keduanya" : t.charAt(0) + t.slice(1).toLowerCase()}
              </Badge>
            </Link>
          ))}
          <div className="w-px bg-slate-200" />
          {/* Status filter */}
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(type !== "ALL" ? { type } : {}), status: s }).toString()}`}
            >
              <Badge
                variant="outline"
                className={`cursor-pointer font-bold text-xs px-3 py-1.5 transition-colors ${
                  status === s
                    ? s === "ACTIVE"
                      ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                      : s === "INACTIVE"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-blue-950 text-white border-blue-950"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s === "ALL" ? "Semua Status" : s === "ACTIVE" ? "Aktif" : "Nonaktif"}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <Suspense fallback={<div className="text-slate-400 text-sm py-8 text-center">Memuat produk...</div>}>
        <ProductTable products={products} />
      </Suspense>
    </div>
  );
}
