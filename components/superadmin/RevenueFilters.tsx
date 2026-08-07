"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
}

interface RevenueFiltersProps {
  products: Product[];
  currentMonth: string;
  currentYear: string;
  currentSegment: string;
  currentProductId: string;
  exportUrl: string;
}

export function RevenueFilters({ products, currentMonth, currentYear, currentSegment, currentProductId, exportUrl }: RevenueFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openProduct, setOpenProduct] = useState(false);

  // Years logic: 2024 to current + 1
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYearNum - 2 + i));
  const months = [
    { value: "0", label: "Januari" },
    { value: "1", label: "Februari" },
    { value: "2", label: "Maret" },
    { value: "3", label: "April" },
    { value: "4", label: "Mei" },
    { value: "5", label: "Juni" },
    { value: "6", label: "Juli" },
    { value: "7", label: "Agustus" },
    { value: "8", label: "September" },
    { value: "9", label: "Oktober" },
    { value: "10", label: "November" },
    { value: "11", label: "Desember" },
  ];

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-semibold text-slate-500">Bulan</label>
        <Select value={currentMonth} onValueChange={(val) => updateParam("month", val)}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-semibold text-slate-500">Tahun</label>
        <Select value={currentYear} onValueChange={(val) => updateParam("year", val)}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Pilih Tahun" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <label className="text-xs font-semibold text-slate-500">Segmen</label>
        <Select value={currentSegment || "ALL"} onValueChange={(val) => updateParam("segment", val)}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Semua Segmen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Segmen</SelectItem>
            <SelectItem value="B2C">B2C Saja</SelectItem>
            <SelectItem value="B2B">B2B Saja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 flex-[2]">
        <label className="text-xs font-semibold text-slate-500">Produk</label>
        <div className="flex gap-2">
          <Popover open={openProduct} onOpenChange={setOpenProduct}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProduct}
                className="w-full justify-between bg-slate-50 border-slate-200 font-normal"
              >
                {currentProductId
                  ? products.find((product) => product.id === currentProductId)?.name
                  : "Semua Produk"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Cari produk..." />
                <CommandList>
                  <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="ALL"
                      onSelect={() => {
                        updateParam("productId", "ALL");
                        setOpenProduct(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !currentProductId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Semua Produk
                    </CommandItem>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name} 
                        onSelect={() => {
                          updateParam("productId", product.id);
                          setOpenProduct(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentProductId === product.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {product.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {currentProductId && (
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0"
              onClick={() => updateParam("productId", "ALL")}
            >
              <X className="h-4 w-4 text-slate-500" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2">
        <a href={exportUrl} download>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );
}
