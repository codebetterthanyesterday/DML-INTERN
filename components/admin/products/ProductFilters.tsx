"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  currentQ: string;
  currentType: string;
  currentStatus: string;
}

export function ProductFilters({ currentQ, currentType, currentStatus }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "ALL") p.delete(k);
      else p.set(k, v);
    });
    return `${pathname}?${p.toString()}`;
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <form
        className="w-full relative"
        onSubmit={(e) => {
          e.preventDefault();
          const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          router.push(buildUrl({ q }));
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          name="q"
          defaultValue={currentQ}
          placeholder="Cari nama produk atau SKU..."
          className="w-full pl-9 bg-white border-slate-200 focus:border-blue-900 transition-all duration-200 rounded-lg sm:max-w-md"
          autoComplete="off"
        />
      </form>

      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
        <Select
          value={currentType}
          onValueChange={(v) => router.push(buildUrl({ type: v }))}
        >
          <SelectTrigger className="w-full xs:flex-1 sm:w-[160px] bg-white border-slate-200 font-semibold text-slate-700 transition-all duration-200 rounded-lg">
            <SelectValue placeholder="Tipe Produk" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="RETAIL">Retail</SelectItem>
            <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
            <SelectItem value="BOTH">Keduanya</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentStatus}
          onValueChange={(v) => router.push(buildUrl({ status: v }))}
        >
          <SelectTrigger className="w-full xs:flex-1 sm:w-[160px] bg-white border-slate-200 font-semibold text-slate-700 transition-all duration-200 rounded-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Aktif</SelectItem>
            <SelectItem value="INACTIVE">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
