"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Package, Check } from "lucide-react";

export interface StockPickerProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
}

interface ProductPickerProps {
  products: StockPickerProduct[];
  value: string;
  onChange: (productId: string) => void;
  error?: string;
}

// Lightweight searchable product combobox. A full Command/cmdk component isn't
// part of this project's UI kit yet, so this stays intentionally simple:
// an input that filters an inline dropdown list, matching the visual language
// already used for filters/search elsewhere in the admin (see ProductFilters).
export function ProductPicker({ products, value, onChange, error }: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = products.find((p) => p.id === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return products.slice(0, 50);
    const q = query.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 50);
  }, [products, query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
        <Input
          value={open ? query : selected ? `${selected.name} (${selected.sku})` : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Cari nama produk atau SKU..."
          className={cn(
            "pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200/80 rounded-lg sm:rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 text-sm sm:text-base",
            error && "border-red-400 focus:border-red-400 focus:ring-red-100"
          )}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="productId" value={value} />

      {open && (
        <div className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto rounded-lg sm:rounded-lg border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150">
          {filtered.length === 0 ? (
            <div className="p-4 sm:p-5 text-sm text-slate-500 text-center flex flex-col items-center gap-2">
              <Package className="w-8 h-8 text-slate-300" />
              <span>Produk tidak ditemukan.</span>
            </div>
          ) : (
            filtered.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(p.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all duration-150 border-b border-slate-100/50 last:border-0 hover:bg-red-50/40",
                  value === p.id && "bg-red-50/80 border-b border-red-100/50"
                )}
                style={{
                  animation: `slideDown 0.2s ease-out ${idx * 20}ms both`,
                }}
              >
                <style>{`
                  @keyframes slideDown {
                    from {
                      opacity: 0;
                      transform: translateY(-4px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
                <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-400 group-hover:from-blue-100 group-hover:to-slate-50 transition-colors duration-200">
                  <Package className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-semibold text-slate-800 truncate">{p.name}</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-mono">{p.sku} · Stok: {p.stock} {p.unit}</div>
                </div>
                {value === p.id && (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0 animate-in scale-100 duration-150" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs sm:text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
