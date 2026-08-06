// Shared stock-availability helpers used by both the server (filtering/
// stats in lib/actions/products.ts) and the client (badge rendering in
// ProductTable). Kept framework-agnostic (no "use server"/"use client")
// so it can be imported from either side.

export type StockAvailability = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

// A product's "low stock" line depends on its own lowStockThreshold, so this
// can't be expressed as a fixed constant — it's always a per-product,
// column-to-column comparison.
export function getStockAvailability(product: { stock: number; lowStockThreshold: number }): StockAvailability {
  if (product.stock <= 0) return "OUT_OF_STOCK";
  if (product.stock <= product.lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export const STOCK_AVAILABILITY_META: Record<
  StockAvailability,
  { label: string; dotClass: string; textClass: string; badgeClass: string }
> = {
  IN_STOCK: {
    label: "Tersedia",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  LOW_STOCK: {
    label: "Menipis",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  OUT_OF_STOCK: {
    label: "Habis",
    dotClass: "bg-red-500",
    textClass: "text-red-600",
    badgeClass: "bg-red-50 text-red-600 border-red-200/60",
  },
};
