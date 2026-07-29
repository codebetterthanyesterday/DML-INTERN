"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, ToggleLeft, ToggleRight, ImageOff } from "lucide-react";
import { deleteProduct, toggleProductStatus } from "@/lib/actions/products";
import type { Product, Category, ProductImage } from "@prisma/client";

type ProductWithRelations = Omit<Product, "price"> & {
  price: number | null;
  category: Category;
  images: ProductImage[];
};

interface ProductTableProps {
  products: ProductWithRelations[];
}

const typeBadge = (type: string) => {
  switch (type) {
    case "RETAIL":
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold hover:bg-blue-50">Retail</Badge>;
    case "INDUSTRIAL":
      return <Badge className="bg-red-50 text-red-600 border-red-100 font-bold hover:bg-red-50">Industrial</Badge>;
    case "BOTH":
      return <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold hover:bg-purple-50">Keduanya</Badge>;
    default:
      return null;
  }
};

export function ProductTable({ products }: ProductTableProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggle = (id: string, current: boolean) => {
    startTransition(() => {
      toggleProductStatus(id, current);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      deleteProduct(id).then(() => setDeleteId(null));
    });
  };

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-20 flex flex-col items-center gap-3 text-slate-400">
        <ImageOff className="w-10 h-10 opacity-40" />
        <p className="font-semibold text-sm">Tidak ada produk ditemukan</p>
        <p className="text-xs">Coba ubah filter atau tambahkan produk baru.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide w-12">Foto</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide">Nama / SKU</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide">Kategori</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide">Tipe</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide">Stok</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide">Harga</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wide text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                <TableCell>
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <ImageOff className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-blue-950 text-sm">{product.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{product.sku}</div>
                </TableCell>
                <TableCell className="text-slate-600 text-sm font-medium">{product.category.name}</TableCell>
                <TableCell>{typeBadge(product.productType)}</TableCell>
                <TableCell>
                  <span className={`font-bold text-sm ${product.stock === 0 ? "text-red-500" : product.stock < 20 ? "text-orange-500" : "text-blue-950"}`}>
                    {product.stock.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">{product.unit}</span>
                </TableCell>
                <TableCell className="text-slate-700 text-sm font-semibold">
                  {product.price
                    ? `Rp ${Number(product.price).toLocaleString("id-ID")}`
                    : <span className="text-slate-400 italic text-xs">Custom (B2B)</span>}
                </TableCell>
                <TableCell>
                  {product.isActive ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200 font-bold hover:bg-green-50">Aktif</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-bold hover:bg-slate-100">Nonaktif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-950 hover:bg-slate-100"
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Buka menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Produk
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleToggle(product.id, product.isActive)}
                      >
                        {product.isActive ? (
                          <><ToggleLeft className="w-3.5 h-3.5" />Nonaktifkan</>
                        ) : (
                          <><ToggleRight className="w-3.5 h-3.5 text-green-600" />Aktifkan</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Produk
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-950 font-extrabold">Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen dari database beserta semua data terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
