"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import type { Product, Category, ProductImage } from "@prisma/client";
import type { ProductFormState } from "@/lib/actions/products";

type ProductWithRelations = Omit<Product, "price"> & {
  price: number | null;
  category: Category;
  images: ProductImage[];
};

interface ProductFormProps {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  product?: ProductWithRelations | null;
  mode: "create" | "edit";
}

const PRODUCT_TYPES = [
  { value: "RETAIL", label: "Retail (B2C)", description: "Produk dengan harga tetap, bisa dibeli langsung" },
  { value: "INDUSTRIAL", label: "Industrial (B2B / RFQ)", description: "Harga custom, butuh penawaran" },
  { value: "BOTH", label: "Keduanya", description: "Tersedia untuk retail & industrial" },
];

const UNITS = ["pcs", "meter", "kg", "roll", "lembar", "set", "box", "liter"];

export function ProductForm({ action, categories, product, mode }: ProductFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(action, {});

  const specs = (product?.specifications ?? {}) as Record<string, string>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="border-slate-200 text-slate-500 hover:text-blue-950 hover:border-blue-950"
          onClick={() => router.push("/admin/products")}
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">
            {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
          </h1>
          <p className="text-slate-500 mt-0.5 font-medium text-sm">
            {mode === "create" ? "Isi detail produk untuk menambahkan ke katalog." : `Mengedit: ${product?.name}`}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {state.error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column — Main Info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-widest">Informasi Dasar</h2>

              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">
                  Nama Produk <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name ?? ""}
                  placeholder="contoh: Rubber Sheet SBR 3mm"
                  className={`border-slate-200 focus:border-blue-900 ${state.fieldErrors?.name ? "border-red-400 focus:border-red-400" : ""}`}
                />
                {state.fieldErrors?.name && <p className="text-xs text-red-500 font-medium">{state.fieldErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="sku" className="text-sm font-bold text-slate-700">
                    SKU <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={product?.sku ?? ""}
                    placeholder="contoh: RBR-SBR-3MM"
                    className={`border-slate-200 font-mono focus:border-blue-900 ${state.fieldErrors?.sku ? "border-red-400" : ""}`}
                  />
                  {state.fieldErrors?.sku && <p className="text-xs text-red-500 font-medium">{state.fieldErrors.sku}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="categoryId" className="text-sm font-bold text-slate-700">Kategori</Label>
                  <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
                    <SelectTrigger className="border-slate-200 focus:border-blue-900">
                      <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                      {categories.length === 0 && (
                        <SelectItem value="" disabled>Belum ada kategori</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm font-bold text-slate-700">Deskripsi Produk</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  placeholder="Deskripsikan kegunaan, keunggulan, dan detail produk..."
                  className="border-slate-200 focus:border-blue-900 min-h-[100px] resize-y"
                />
              </div>
            </div>

            {/* Pricing & Stock Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-widest">Harga & Stok</h2>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Tipe Produk <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRODUCT_TYPES.map((type) => (
                    <label key={type.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="productType"
                        value={type.value}
                        defaultChecked={product?.productType === type.value || (!product && type.value === "RETAIL")}
                        className="peer sr-only"
                      />
                      <div className="rounded-lg border-2 border-slate-200 p-3 text-sm transition-all peer-checked:border-blue-950 peer-checked:bg-blue-950 peer-checked:text-white">
                        <div className="font-bold">{type.label}</div>
                        <div className="text-xs opacity-70 mt-0.5 leading-tight">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="price" className="text-sm font-bold text-slate-700">
                    Harga (Rp)
                    <span className="ml-1 text-xs font-normal text-slate-400">kosongkan jika B2B custom</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="100"
                    defaultValue={product?.price ? String(product.price) : ""}
                    placeholder="contoh: 25000"
                    className="border-slate-200 focus:border-blue-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unit" className="text-sm font-bold text-slate-700">
                    Satuan <span className="text-red-500">*</span>
                  </Label>
                  <Select name="unit" defaultValue={product?.unit ?? ""}>
                    <SelectTrigger className={`border-slate-200 focus:border-blue-900 ${state.fieldErrors?.unit ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Satuan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stock" className="text-sm font-bold text-slate-700">
                    Stok <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={product?.stock ?? 0}
                    className={`border-slate-200 focus:border-blue-900 ${state.fieldErrors?.stock ? "border-red-400" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-1 max-w-xs">
                <Label htmlFor="minOrderQty" className="text-sm font-bold text-slate-700">Min. Order Qty</Label>
                <Input
                  id="minOrderQty"
                  name="minOrderQty"
                  type="number"
                  min="1"
                  defaultValue={product?.minOrderQty ?? 1}
                  className="border-slate-200 focus:border-blue-900"
                />
              </div>
            </div>

            {/* Specs Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-widest">Spesifikasi Teknis</h2>
              <p className="text-xs text-slate-400 -mt-2">Isi yang relevan, kosongkan yang tidak berlaku.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "ketebalan", label: "Ketebalan", placeholder: "contoh: 3mm" },
                  { name: "material", label: "Material", placeholder: "contoh: SBR, EPDM, Natural" },
                  { name: "hardness", label: "Hardness (Shore A)", placeholder: "contoh: 60±5" },
                  { name: "ukuran", label: "Ukuran / Dimensi", placeholder: "contoh: 1m x 10m" },
                ].map((field) => (
                  <div key={field.name} className="space-y-1">
                    <Label htmlFor={field.name} className="text-sm font-bold text-slate-700">{field.label}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      defaultValue={specs[field.name] ?? ""}
                      placeholder={field.placeholder}
                      className="border-slate-200 focus:border-blue-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5">

            {/* Publish Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-widest">Publikasi</h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive" className="text-sm font-bold text-slate-700">Status Produk</Label>
                  <p className="text-xs text-slate-400 mt-0.5">Produk aktif akan tampil di katalog</p>
                </div>
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={product ? product.isActive : true}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Link href="/admin/products" className="flex-1">
                  <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 gap-2"
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" />Simpan</>
                  )}
                </Button>
              </div>
            </div>

            {/* Image Upload Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-extrabold text-blue-950 uppercase tracking-widest">Gambar Produk</h2>
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-2 text-slate-400 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.233 8.5" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-center leading-relaxed">
                  Upload gambar produk<br/>
                  <span className="font-normal opacity-70">PNG, JPG, max 5MB</span>
                </p>
              </div>
              <p className="text-xs text-slate-400 text-center">Fitur upload gambar akan ditambahkan segera.</p>
            </div>

            {/* Quick Info Card */}
            {product && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-2">
                <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Info Produk</h2>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Dibuat</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(product.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diperbarui</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(product.updatedAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slug</span>
                    <span className="font-mono text-[11px] text-slate-500">{product.slug}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
