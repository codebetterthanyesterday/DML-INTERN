"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import { MoreHorizontal, Pencil, Trash2, ToggleLeft, ToggleRight, ImageOff, Eye, Package, Tag, Radio, WifiOff } from "lucide-react";
import { deleteProduct, toggleProductStatus } from "@/lib/actions/products";
import type { Product, Category, ProductImage } from "@prisma/client/browser";
import { ProductDetailsSheet } from "./ProductDetailsSheet";
import { getStockAvailability, STOCK_AVAILABILITY_META } from "@/lib/utils/stock";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type ProductWithRelations = Omit<Product, "price"> & {
  price: number | null;
  category: Category;
  images: ProductImage[];
};

interface ProductTableProps {
  products: ProductWithRelations[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialProductId = searchParams.get("productId");

  useEffect(() => {
    if (initialProductId && products.length > 0) {
      const product = products.find((p) => p.id === initialProductId);
      if (product) {
        setSelectedProduct(product);
        // Clean up the URL to remove productId so it doesn't reopen on refresh or if sheet is closed
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("productId");
        router.replace(`${pathname}?${newParams.toString()}`);
      }
    }
  }, [initialProductId, products, searchParams, pathname, router]);

  // Keeps the stock column live: subscribes to the stock_log_changes SSE
  // stream (Postgres LISTEN/NOTIFY, fired on every stock in/out/opname — see
  // /api/admin/stock-logs/stream) and refreshes this page's server data the
  // instant any admin records a stock movement, from any tab, no polling.
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      es = new EventSource("/api/admin/stock-logs/stream");

      es.addEventListener("connected", () => setLiveStatus("live"));

      es.addEventListener("stock_log", () => {
        // Debounce: a burst of movements (e.g. bulk opname) should trigger a
        // single refresh instead of one per event.
        if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
        refreshTimeout.current = setTimeout(() => router.refresh(), 400);
      });

      es.onerror = () => {
        if (cancelled) return;
        setLiveStatus("reconnecting");
        es?.close();
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (id: string, current: boolean) => {
    startTransition(() => {
      toggleProductStatus(id, current);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      deleteProduct(id)
        .then((result) => {
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Produk berhasil dihapus");
          }
        })
        .catch(() => {
          toast.error("Gagal menghapus produk. Silakan coba lagi.");
        })
        .finally(() => {
          setDeleteId(null);
        });
    });
  };

  const liveIndicator = (
    <div className="flex items-center justify-end mb-3">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold border transition-all duration-300",
          liveStatus === "live" && "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-200/50",
          liveStatus === "connecting" && "bg-slate-100 text-slate-500 border-slate-200",
          liveStatus === "reconnecting" && "bg-amber-50 text-amber-700 border-amber-200/80"
        )}
        title="Status koneksi real-time stok"
      >
        {liveStatus === "live" ? <Radio className="w-2.5 h-2.5 animate-pulse" /> : <WifiOff className="w-2.5 h-2.5" />}
        <span>{liveStatus === "live" ? "Stok Live" : liveStatus === "connecting" ? "Menghubungkan..." : "Menyambung ulang..."}</span>
      </div>
    </div>
  );

  if (products.length === 0) {
    return (
      <>
        {liveIndicator}
        <div className="rounded-xl border border-slate-200 bg-white py-12 sm:py-20 flex flex-col items-center gap-3 text-slate-400 px-4">
          <ImageOff className="w-10 h-10 opacity-40" />
          <p className="font-semibold text-sm sm:text-base">Tidak ada produk ditemukan</p>
          <p className="text-xs sm:text-sm text-center">Coba ubah filter atau tambahkan produk baru.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Live status - stock figures below update in real time */}
      {liveIndicator}

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider py-4 pl-6">Produk</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Kategori</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Stok</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.id} 
                  className="group hover:bg-red-50/40 border-slate-100 transition-all cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200/60 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors line-clamp-1">{product.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50/50 text-slate-600 font-medium border-slate-200/60 shadow-sm">
                      {product.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col justify-center">
                      <span className={`font-bold text-sm flex items-center gap-1.5 ${STOCK_AVAILABILITY_META[getStockAvailability(product)].textClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STOCK_AVAILABILITY_META[getStockAvailability(product)].dotClass}`}></span>
                        {product.stock.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider ml-3">{product.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold hover:bg-emerald-50 shadow-sm">Aktif</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200/60 font-semibold hover:bg-slate-100 shadow-sm">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-all duration-200"
                          disabled={isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Buka menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-lg">
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-blue-800 transition-all duration-200"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer transition-all duration-200">
                          <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Produk
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(product.id, product.isActive);
                          }}
                        >
                          {product.isActive ? (
                            <><ToggleLeft className="w-3.5 h-3.5" />Nonaktifkan</>
                          ) : (
                            <><ToggleRight className="w-3.5 h-3.5 text-green-600" />Aktifkan</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(product.id);
                          }}
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
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3 px-1">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 active:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            {/* Product Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200/60 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Package className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors line-clamp-2">{product.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1 line-clamp-1">
                  <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                  {product.sku}
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-all duration-200"
                      disabled={isPending}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Buka menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-lg">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-blue-800 transition-all duration-200"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer transition-all duration-200">
                      <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Produk
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(product.id, product.isActive);
                      }}
                    >
                      {product.isActive ? (
                        <><ToggleLeft className="w-3.5 h-3.5" />Nonaktifkan</>
                      ) : (
                        <><ToggleRight className="w-3.5 h-3.5 text-green-600" />Aktifkan</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(product.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Produk
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Category */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori</span>
                <Badge variant="outline" className="bg-slate-50/50 text-slate-600 font-medium border-slate-200/60 shadow-sm text-xs w-fit">
                  {product.category.name}
                </Badge>
              </div>

              {/* Stock */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stok</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STOCK_AVAILABILITY_META[getStockAvailability(product)].dotClass}`}></span>
                  <span className={`font-bold text-sm ${STOCK_AVAILABILITY_META[getStockAvailability(product)].textClass}`}>
                    {product.stock.toLocaleString("id-ID")} {product.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              {product.isActive ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold hover:bg-emerald-50 shadow-sm text-xs">Aktif</Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 border-slate-200/60 font-semibold hover:bg-slate-100 shadow-sm text-xs">Nonaktif</Badge>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-950 font-extrabold">Hapus Produk?</AlertDialogTitle>
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

      <ProductDetailsSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </>
  );
}
