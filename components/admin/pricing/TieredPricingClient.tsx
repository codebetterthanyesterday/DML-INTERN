"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  Pencil,
  Tag,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Info,
  X,
  GripVertical,
  Sparkles,
  ArrowRight,
  DollarSign,
  Layers,
  Eye,
  Save,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProductTiers } from "@/lib/actions/pricing";
import toast from "react-hot-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TierRow {
  id: string;
  minQty: number;
  maxQty: number | null; // null = unlimited
  pricePerUnit: number;
}

export interface ProductWithTiers {
  id: string;
  name: string;
  sku: string;
  unit: string;
  basePrice: number | null;
  productType: "RETAIL" | "INDUSTRIAL" | "BOTH";
  categoryName: string;
  imageUrl?: string | null;
  tiers: TierRow[];
}

interface TieredPricingClientProps {
  products: ProductWithTiers[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function validateTiers(tiers: TierRow[]): string | null {
  if (tiers.length === 0) return null;
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (!t.minQty || t.minQty < 1) return `Tier ${i + 1}: Min qty harus ≥ 1`;
    if (t.maxQty !== null && t.maxQty <= t.minQty)
      return `Tier ${i + 1}: Max qty harus lebih besar dari min qty`;
    if (!t.pricePerUnit || t.pricePerUnit <= 0)
      return `Tier ${i + 1}: Harga harus > 0`;
    if (i > 0) {
      const prev = tiers[i - 1];
      const expectedMin = prev.maxQty !== null ? prev.maxQty + 1 : null;
      if (prev.maxQty === null && i < tiers.length - 1)
        return `Tier ${i}: Hanya tier terakhir yang bisa tanpa batas atas`;
      if (expectedMin !== null && t.minQty !== expectedMin)
        return `Tier ${i + 1}: Min qty harus melanjutkan tier sebelumnya (${expectedMin})`;
    }
  }
  return null;
}

// ─── Tier Discount Badge ──────────────────────────────────────────────────────

function DiscountBadge({ base, price }: { base: number | null; price: number }) {
  if (!base || base === 0) return null;
  const disc = ((base - price) / base) * 100;
  if (disc <= 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
      <TrendingDown className="w-2.5 h-2.5" />
      -{disc.toFixed(0)}%
    </span>
  );
}

// ─── Tier Row Editor ──────────────────────────────────────────────────────────

interface TierRowEditorProps {
  tier: TierRow;
  index: number;
  total: number;
  basePrice: number | null;
  onChange: (id: string, field: keyof TierRow, value: number | null) => void;
  onDelete: (id: string) => void;
}

function TierRowEditor({ tier, index, total, basePrice, onChange, onDelete }: TierRowEditorProps) {
  const isLast = index === total - 1;

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-all duration-200",
        "bg-white border-slate-200 hover:border-red-200 hover:shadow-md hover:shadow-red-600/5"
      )}
    >
      {/* Tier label bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5 rounded-t-xl border-b",
          index === 0
            ? "bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600"
            : index === 1
            ? "bg-gradient-to-r from-red-700 to-red-600 border-red-500"
            : index === 2
            ? "bg-gradient-to-r from-amber-600 to-orange-500 border-amber-400"
            : "bg-gradient-to-r from-emerald-700 to-teal-600 border-emerald-500"
        )}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white/40" />
          <span className="text-xs font-black text-white tracking-widest uppercase">
            Tier {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {tier.pricePerUnit > 0 && (
            <DiscountBadge base={basePrice} price={tier.pricePerUnit} />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-white/60 hover:text-white hover:bg-white/20 rounded-lg"
            onClick={() => onDelete(tier.id)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Min Qty */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Min Qty
          </label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              value={tier.minQty || ""}
              onChange={(e) => onChange(tier.id, "minQty", parseInt(e.target.value) || 0)}
              className="pl-3 pr-2 h-9 text-sm font-semibold border-slate-200 focus:border-red-400 focus:ring-red-100 rounded-lg"
              placeholder="mis. 1"
            />
          </div>
        </div>

        {/* Max Qty */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Max Qty
            </label>
            {isLast && (
              <button
                type="button"
                onClick={() => onChange(tier.id, "maxQty", tier.maxQty === null ? 0 : null)}
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors",
                  tier.maxQty === null
                    ? "bg-blue-950 text-white border-blue-900"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-900 hover:text-blue-900"
                )}
              >
                {tier.maxQty === null ? "∞ Tanpa Batas" : "Set Batas"}
              </button>
            )}
          </div>
          <Input
            type="number"
            min={1}
            disabled={tier.maxQty === null}
            value={tier.maxQty === null ? "" : tier.maxQty || ""}
            onChange={(e) => onChange(tier.id, "maxQty", parseInt(e.target.value) || 0)}
            className={cn(
              "h-9 text-sm font-semibold border-slate-200 focus:border-red-400 focus:ring-red-100 rounded-lg",
              tier.maxQty === null && "bg-slate-50 text-slate-400 cursor-not-allowed"
            )}
            placeholder={tier.maxQty === null ? "Tidak terbatas" : "mis. 99"}
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Harga / Unit (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              Rp
            </span>
            <Input
              type="number"
              min={0}
              value={tier.pricePerUnit || ""}
              onChange={(e) =>
                onChange(tier.id, "pricePerUnit", parseFloat(e.target.value) || 0)
              }
              className="pl-8 h-9 text-sm font-semibold border-slate-200 focus:border-red-400 focus:ring-red-100 rounded-lg"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Range pill */}
      <div className="px-4 pb-3">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
          <span className="font-bold text-slate-700">{tier.minQty || "?"}</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-bold text-slate-700">
            {tier.maxQty === null ? "∞" : tier.maxQty || "?"}
          </span>
          <span>unit</span>
          {tier.pricePerUnit > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-red-600">{formatRupiah(tier.pricePerUnit)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Preview ─────────────────────────────────────────────────────────

function PricingPreview({ tiers, unit }: { tiers: TierRow[]; unit: string }) {
  const [qty, setQty] = useState(1);

  const activeTier = tiers.find(
    (t) => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)
  );
  const total = activeTier ? activeTier.pricePerUnit * qty : null;

  return (
    <div className="rounded-xl border border-blue-950/20 bg-gradient-to-br from-blue-950 to-slate-900 p-4 text-white space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-blue-300" />
        <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
          Preview Harga Customer
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-blue-200/70 font-medium">Masukkan Jumlah Beli</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 h-8 text-sm font-bold bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-300 focus:ring-0"
          />
          <span className="text-sm text-blue-200/70 font-medium">{unit}</span>
        </div>
      </div>

      {tiers.length === 0 ? (
        <p className="text-xs text-white/40 italic">Belum ada tier dibuat</p>
      ) : activeTier ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-blue-200/70">
            <span>Tier aktif</span>
            <Badge className="bg-white/15 text-white border-white/20 text-[10px] font-bold">
              {activeTier.minQty}–{activeTier.maxQty ?? "∞"} {unit}
            </Badge>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-blue-200/60">Harga/unit</div>
              <div className="text-lg font-extrabold text-white">
                {formatRupiah(activeTier.pricePerUnit)}
              </div>
            </div>
            {total !== null && (
              <div className="text-right">
                <div className="text-xs text-blue-200/60">Total ({qty} {unit})</div>
                <div className="text-xl font-black text-emerald-300">
                  {formatRupiah(total)}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-300/80 font-medium">
          ⚠ Jumlah di luar range tier yang ada
        </p>
      )}

      {/* Tier overview pills */}
      {tiers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
          {tiers.map((t, i) => (
            <div
              key={t.id}
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all",
                activeTier?.id === t.id
                  ? "bg-red-500 border-red-400 text-white"
                  : "bg-white/10 border-white/20 text-white/60"
              )}
            >
              T{i + 1}: {t.minQty}–{t.maxQty ?? "∞"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

interface EditDialogProps {
  product: ProductWithTiers;
  open: boolean;
  onClose: () => void;
  onSave: (productId: string, tiers: TierRow[]) => void;
}

function EditDialog({ product, open, onClose, onSave }: EditDialogProps) {
  const [tiers, setTiers] = useState<TierRow[]>(() =>
    product.tiers.map((t) => ({ ...t }))
  );

  const validationError = useMemo(() => validateTiers(tiers), [tiers]);

  const handleAdd = () => {
    const last = tiers[tiers.length - 1];
    const newMin =
      last?.maxQty !== null && last?.maxQty !== undefined
        ? last.maxQty + 1
        : tiers.length === 0
        ? 1
        : (last?.minQty ?? 0) + 10;

    // Ensure the last tier has a maxQty before adding a new one
    const updatedTiers = tiers.map((t, i) => {
      if (i === tiers.length - 1 && t.maxQty === null) {
        return { ...t, maxQty: newMin - 1 };
      }
      return t;
    });

    setTiers([
      ...updatedTiers,
      {
        id: generateId(),
        minQty: newMin,
        maxQty: null,
        pricePerUnit: 0,
      },
    ]);
  };

  const handleChange = useCallback(
    (id: string, field: keyof TierRow, value: number | null) => {
      setTiers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
    },
    []
  );

  const handleDelete = useCallback((id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleReset = () => {
    setTiers(product.tiers.map((t) => ({ ...t })));
  };

  const handleSave = () => {
    if (validationError) return;
    onSave(product.id, tiers);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-red-600" />
              </div>
              Atur Tiered Pricing
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              <span className="font-bold text-slate-700">{product.name}</span>{" "}
              <Badge variant="outline" className="text-[10px] font-bold ml-1 border-slate-200">
                {product.sku}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {product.basePrice && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-medium">Harga dasar:</span>
              <span className="font-black text-slate-800">
                {formatRupiah(product.basePrice)}/{product.unit}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Diskon dihitung berdasarkan harga dasar produk
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: Tier Editor */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-600" />
                Skema Tier
                <Badge className="bg-red-600 text-white text-[10px] font-black ml-1 px-1.5 py-0.5 rounded-full">
                  {tiers.length}
                </Badge>
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-700 text-xs gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            </div>

            {tiers.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-2">
                <Tag className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">Belum ada tier</p>
                <p className="text-xs text-slate-400">Klik tombol di bawah untuk menambah tier harga</p>
              </div>
            )}

            <div className="space-y-3">
              {tiers.map((tier, i) => (
                <TierRowEditor
                  key={tier.id}
                  tier={tier}
                  index={i}
                  total={tiers.length}
                  basePrice={product.basePrice}
                  onChange={handleChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <Button
              type="button"
              onClick={handleAdd}
              variant="outline"
              className="w-full border-dashed border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 font-bold gap-2 h-10 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Tier
            </Button>

            {validationError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{validationError}</span>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-2 space-y-4">
            <PricingPreview tiers={tiers} unit={product.unit} />

            {/* Quick tips */}
            <div className="rounded-xl border border-blue-950/10 bg-blue-950/5 p-3.5 space-y-2">
              <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Tips Tiered Pricing
              </p>
              <ul className="space-y-1.5">
                {[
                  "Tier pertama biasanya harga satuan normal",
                  "Semakin banyak pembelian, semakin murah harganya",
                  "Tier terakhir bisa tanpa batas atas (∞)",
                  "Min qty harus melanjutkan max qty tier sebelumnya",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 rounded-b-2xl">
          <span className="text-xs text-slate-400 font-medium">
            {tiers.length} tier dikonfigurasi
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!!validationError}
              className={cn(
                "bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-md shadow-red-600/20 transition-all",
                validationError && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              Simpan Pricing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product Card (mobile) ─────────────────────────────────────────────────────

function ProductPricingCard({
  product,
  onEdit,
}: {
  product: ProductWithTiers;
  onEdit: (p: ProductWithTiers) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasTiers = product.tiers.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-red-200 transition-all duration-200">
      <div className="flex items-center gap-3 p-4">
        {/* Image / Icon */}
        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-900 text-sm truncate">{product.name}</span>
            <Badge variant="outline" className="text-[10px] font-bold border-slate-200 shrink-0">
              {product.sku}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">{product.categoryName}</span>
            {product.basePrice && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-700">
                  {formatRupiah(product.basePrice)}/{product.unit}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasTiers ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px]">
              {product.tiers.length} tier
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold text-[10px]">
              Belum ada
            </Badge>
          )}
          <Button
            size="sm"
            onClick={() => onEdit(product)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1 h-8 px-3 shadow-sm shadow-red-600/20"
          >
            <Pencil className="w-3 h-3" />
            Atur
          </Button>
          {hasTiers && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setExpanded((v) => !v)}
              className="w-8 h-8 text-slate-400 hover:text-slate-700"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {hasTiers && expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Struktur Tier
            </span>
          </div>
          <div className="space-y-1.5">
            {product.tiers.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0",
                      i === 0
                        ? "bg-slate-700"
                        : i === 1
                        ? "bg-red-600"
                        : i === 2
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    )}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {t.minQty}–{t.maxQty ?? "∞"} {product.unit}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-red-600">
                    {formatRupiah(t.pricePerUnit)}
                  </span>
                  <DiscountBadge base={product.basePrice} price={t.pricePerUnit} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ───────────────────────────────────────────────────

export function TieredPricingClient({ products: initialProducts }: TieredPricingClientProps) {
  const [products, setProducts] = useState<ProductWithTiers[]>(initialProducts);
  const [editProduct, setEditProduct] = useState<ProductWithTiers | null>(null);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<"ALL" | "WITH" | "WITHOUT">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchesTier =
        filterTier === "ALL" ||
        (filterTier === "WITH" && p.tiers.length > 0) ||
        (filterTier === "WITHOUT" && p.tiers.length === 0);
      return matchesSearch && matchesTier;
    });
  }, [products, search, filterTier]);

  const stats = useMemo(() => ({
    total: products.length,
    withTiers: products.filter((p) => p.tiers.length > 0).length,
    withoutTiers: products.filter((p) => p.tiers.length === 0).length,
    totalTiers: products.reduce((sum, p) => sum + p.tiers.length, 0),
  }), [products]);

  const handleSave = async (productId: string, tiers: TierRow[]) => {
    const res = await updateProductTiers(
      productId,
      tiers.map((t) => ({
        minQty: t.minQty,
        maxQty: t.maxQty,
        pricePerUnit: t.pricePerUnit,
      }))
    );

    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, tiers } : p))
      );
      toast.success("Tiered pricing berhasil disimpan!", {
        icon: "✅",
        style: { fontWeight: "700" },
      });
    } else {
      toast.error(res.error || "Gagal menyimpan tiered pricing.");
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
              Harga Bertingkat
            </h1>
            <p className="text-slate-600 mt-2 font-medium text-sm sm:text-base">
              Atur skema tiered pricing per produk — makin banyak beli, makin murah harganya.
            </p>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Tabel
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                  viewMode === "cards"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Kartu
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Total Produk",
              value: stats.total,
              icon: Package,
              bg: "bg-blue-950",
              light: "bg-blue-50",
              text: "text-blue-950",
            },
            {
              label: "Sudah Ada Tier",
              value: stats.withTiers,
              icon: CheckCircle2,
              bg: "bg-emerald-600",
              light: "bg-emerald-50",
              text: "text-emerald-700",
            },
            {
              label: "Belum Ada Tier",
              value: stats.withoutTiers,
              icon: AlertCircle,
              bg: "bg-amber-500",
              light: "bg-amber-50",
              text: "text-amber-700",
            },
            {
              label: "Total Tier",
              value: stats.totalTiers,
              icon: Layers,
              bg: "bg-red-600",
              light: "bg-red-50",
              text: "text-red-700",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg sm:rounded-xl shrink-0",
                      s.light
                    )}
                  >
                    <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", s.text)} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                      {s.value}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                      {s.label}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    s.bg
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, SKU, atau kategori..."
              className="pl-9 h-10 border-slate-200 focus:border-red-400 focus:ring-red-100 rounded-xl font-medium text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {(["ALL", "WITH", "WITHOUT"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterTier(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                  filterTier === f
                    ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600"
                )}
              >
                {f === "ALL" ? "Semua" : f === "WITH" ? "Ada Tier" : "Belum Ada"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProductPricingCard key={p.id} product={p} onEdit={setEditProduct} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-400 font-semibold">
                <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                Tidak ada produk ditemukan
              </div>
            )}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
                    <TableHead className="font-extrabold text-slate-700 text-xs uppercase tracking-wider pl-5 py-3.5 w-12">#</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs uppercase tracking-wider py-3.5">Produk</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs uppercase tracking-wider py-3.5 hidden md:table-cell">Harga Dasar</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs uppercase tracking-wider py-3.5 hidden lg:table-cell">Tipe</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs uppercase tracking-wider py-3.5">Tier Pricing</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs uppercase tracking-wider py-3.5 text-right pr-5">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-slate-400 font-semibold">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Tidak ada produk ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((p, idx) => (
                    <TableRow
                      key={p.id}
                      className="group border-b border-slate-100 hover:bg-red-50/30 transition-colors"
                    >
                      <TableCell className="pl-5 text-sm font-bold text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                            {p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-slate-900 truncate max-w-[180px]">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                              <span>{p.sku}</span>
                              <span className="text-slate-300">·</span>
                              <span className="truncate max-w-[100px]">{p.categoryName}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-bold text-slate-800">
                          {p.basePrice ? `${formatRupiah(p.basePrice)}/${p.unit}` : (
                            <span className="text-slate-400 font-medium italic text-xs">Custom/RFQ</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold",
                            p.productType === "RETAIL"
                              ? "border-blue-200 text-blue-700 bg-blue-50"
                              : p.productType === "INDUSTRIAL"
                              ? "border-orange-200 text-orange-700 bg-orange-50"
                              : "border-purple-200 text-purple-700 bg-purple-50"
                          )}
                        >
                          {p.productType === "RETAIL" ? "Retail" : p.productType === "INDUSTRIAL" ? "Industrial" : "Keduanya"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.tiers.length === 0 ? (
                          <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200">
                            Belum diatur
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {p.tiers.map((t, i) => (
                              <Tooltip key={t.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-default",
                                      i === 0
                                        ? "bg-slate-100 text-slate-700 border-slate-200"
                                        : i === 1
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : i === 2
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    )}
                                  >
                                    T{i + 1}: {t.minQty}–{t.maxQty ?? "∞"}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-bold text-xs">{formatRupiah(t.pricePerUnit)}/{p.unit}</p>
                                  {p.basePrice && t.pricePerUnit < p.basePrice && (
                                    <p className="text-emerald-300 text-[10px]">
                                      Diskon {(((p.basePrice - t.pricePerUnit) / p.basePrice) * 100).toFixed(0)}%
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Button
                          size="sm"
                          onClick={() => setEditProduct(p)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 h-8 px-3 shadow-sm shadow-red-600/20 transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                          Atur Tier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {editProduct && (
          <EditDialog
            product={editProduct}
            open={!!editProduct}
            onClose={() => setEditProduct(null)}
            onSave={handleSave}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
