"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Tag,
  Hash,
  Box,
  Scale,
  AlignLeft,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { Product, Category, ProductImage } from "@prisma/client";

type ProductWithRelations = Omit<Product, "price"> & {
  price: number | null;
  category: Category;
  images: ProductImage[];
};

interface ProductDetailsSheetProps {
  product: ProductWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsSheet({
  product,
  open,
  onOpenChange,
}: ProductDetailsSheetProps) {
  if (!product) return null;

  const typeBadgeColor = (type: string) => {
    switch (type) {
      case "RETAIL":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "INDUSTRIAL":
        return "bg-red-100 text-red-700 border-red-200";
      case "BOTH":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const specifications = product.specifications as Record<string, string> | null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col h-full bg-slate-50 border-l-slate-200 overflow-hidden shadow-2xl">
        {/* Header Section */}
        <SheetHeader className="p-6 bg-white border-b border-slate-200 relative z-10 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`font-semibold px-2.5 py-0.5 rounded-full ${typeBadgeColor(product.productType)}`}>
                  {product.productType}
                </Badge>
                {product.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold px-2.5 py-0.5 rounded-full flex gap-1 items-center hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-semibold px-2.5 py-0.5 rounded-full flex gap-1 items-center hover:bg-slate-100">
                    <XCircle className="w-3 h-3" />
                    Nonaktif
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                {product.sku}
              </SheetDescription>
            </div>
            {/* Price Display */}
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Harga</p>
              {product.price ? (
                <div className="text-xl font-extrabold text-blue-950">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </div>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-sm py-1 px-3">
                  Custom (B2B)
                </Badge>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-8">

            {/* Image Gallery */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Galeri Foto
              </h3>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {product.images.map((img, i) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/50 p-8 flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon className="w-8 h-8 opacity-20 mb-2" />
                  <span className="text-sm font-medium">Belum ada foto produk</span>
                </div>
              )}
            </section>

            <Separator className="bg-slate-200/60" />

            {/* Core Info Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Kategori</span>
                </div>
                <p className="font-semibold text-slate-900">{product.category.name}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Stok / Satuan</span>
                </div>
                <p className="font-semibold text-slate-900">
                  <span className={product.stock === 0 ? "text-red-600" : ""}>
                    {product.stock.toLocaleString("id-ID")}
                  </span>{" "}
                  <span className="text-slate-500 font-normal">/ {product.unit}</span>
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Box className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Min. Order</span>
                </div>
                <p className="font-semibold text-slate-900">{product.minOrderQty.toLocaleString("id-ID")} {product.unit}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Berat</span>
                </div>
                <p className="font-semibold text-slate-900">{product.weight.toLocaleString("id-ID")} gram</p>
              </div>
            </section>

            {/* Description */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlignLeft className="w-4 h-4 text-blue-600" />
                Deskripsi Produk
              </h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.description || <span className="italic text-slate-400">Tidak ada deskripsi.</span>}
              </div>
            </section>

            {/* Specifications */}
            {specifications && Object.keys(specifications).length > 0 && (
              <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Spesifikasi Teknis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{key}</span>
                      <span className="text-sm font-medium text-slate-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Timestamps */}
            <section className="flex items-center justify-between text-xs text-slate-400 bg-slate-100/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Dibuat: {new Date(product.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Diperbarui: {new Date(product.updatedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </section>

            {/* Bottom padding for scroll */}
            <div className="h-6"></div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
