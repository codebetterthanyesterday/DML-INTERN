"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Download, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronRight, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { importProducts, type ImportProductsResult, type ImportedProductDetail } from "@/lib/actions/import";
import { importProductRowSchema, ImportProductRow } from "@/lib/validations/import";
import { ProductDetailsSheet, type ProductWithRelations } from "./ProductDetailsSheet";

export function ImportProductsModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ImportProductRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportProductsResult | null>(null);
  const [updatedItemsOpen, setUpdatedItemsOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // Generate a simple Excel template
    const worksheet = XLSX.utils.json_to_sheet([
      {
        name: "Produk Contoh 1",
        sku: "SKU-001",
        categorySlug: "kategori-contoh",
        description: "Deskripsi singkat produk",
        productType: "RETAIL",
        price: 15000,
        unit: "pcs",
        stock: 100,
        minOrderQty: 1,
        weight: 1000,
        isActive: "true"
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Produk");
    XLSX.writeFile(workbook, "template-produk.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewData([]);
      setValidationErrors([]);
      setImportResult(null);
      setSelectedProduct(null);
    }
  };

  const mapImportedProductToDetailsSheetProduct = (
    product: ImportedProductDetail
  ): ProductWithRelations => ({
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
    specifications: null,
  });

  const parseFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setValidationErrors([]);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (json.length === 0) {
        setValidationErrors(["File kosong atau tidak ada data yang dapat dibaca."]);
        setIsProcessing(false);
        return;
      }
      
      if (json.length > 1000) {
        setValidationErrors(["Maksimal 1000 baris dalam satu kali import."]);
        setIsProcessing(false);
        return;
      }

      const validRows: ImportProductRow[] = [];
      const errors: string[] = [];

      json.forEach((row, index) => {
        const rowNum = index + 2; // +1 for 0-index, +1 for header
        const result = importProductRowSchema.safeParse(row);
        if (result.success) {
          validRows.push(result.data);
        } else {
          result.error.issues.forEach(issue => {
            errors.push(`Baris ${rowNum}: Kolom '${issue.path.join('.')}' - ${issue.message}`);
          });
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        setPreviewData([]);
      } else {
        setPreviewData(validRows);
      }
    } catch (err: unknown) {
      console.error(err);
      setValidationErrors(["Terjadi kesalahan saat membaca file. Pastikan format file adalah Excel atau CSV."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    
    try {
      const res = await importProducts(previewData);
      setImportResult(res);
      setValidationErrors(res.errors);
      setPreviewData([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUpdatedItemsOpen(true);

      if (res.failed > 0) {
        toast.error(`Import selesai: ${res.success} berhasil, ${res.failed} gagal.`);
      } else if (res.updated > 0) {
        toast.success(`Import selesai: ${res.success} berhasil, ${res.updated} produk diperbarui.`);
      } else {
        toast.success(`Berhasil mengimport ${res.success} produk!`);
      }

      router.refresh();
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat import.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setIsOpen(false);
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setImportResult(null);
    setUpdatedItemsOpen(true);
    setSelectedProduct(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenProduct = (product: ImportedProductDetail) => {
    setSelectedProduct(mapImportedProductToDetailsSheetProduct(product));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetModal();
      else setIsOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-sm border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
          <FileUp className="w-4 h-4" />
          Import Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Import Produk via Excel/CSV</DialogTitle>
          <DialogDescription>
            Import data produk dalam jumlah banyak secara efisien. Maksimal 1000 baris per file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Gunakan Template Tersedia
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Pastikan nama kolom (header) persis dengan template agar dapat terbaca sistem.
              </p>
            </div>
            <Button onClick={handleDownloadTemplate} variant="secondary" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm shrink-0 gap-2">
              <Download className="w-4 h-4" />
              Unduh Template
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file-upload" className="font-semibold text-slate-700">Upload File (.xlsx, .csv)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx, .csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="cursor-pointer"
              />
              <Button 
                onClick={parseFile} 
                disabled={!file || isProcessing}
                variant="default"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validasi"}
              </Button>
            </div>
          </div>

          {(validationErrors.length > 0 || importResult) && (
            <div className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 max-h-56 overflow-y-auto">
                  <h4 className="font-semibold text-red-800 mb-2">Ditemukan Kesalahan:</h4>
                  <ul className="text-sm text-red-600 space-y-1 list-disc pl-5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Import selesai
                      </div>
                      <p className="text-sm text-emerald-700 mt-1">
                        {importResult.success} produk berhasil diproses.
                        {importResult.updated > 0 ? ` ${importResult.updated} produk diperbarui.` : ""}
                        {importResult.created > 0 ? ` ${importResult.created} produk baru ditambahkan.` : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                      {[
                        { label: "Berhasil", value: importResult.success, tone: "text-emerald-700 bg-white border-emerald-200" },
                        { label: "Baru", value: importResult.created, tone: "text-blue-700 bg-white border-blue-200" },
                        { label: "Diperbarui", value: importResult.updated, tone: "text-amber-700 bg-white border-amber-200" },
                        { label: "Gagal", value: importResult.failed, tone: "text-red-700 bg-white border-red-200" },
                      ].map((item) => (
                        <div key={item.label} className={`rounded-xl border px-3 py-2 ${item.tone}`}>
                          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-70">{item.label}</div>
                          <div className="text-lg font-extrabold leading-none mt-1">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {importResult.updatedProducts.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-white/90 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setUpdatedItemsOpen((open) => !open)}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-amber-50 transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold text-amber-900">Produk yang diperbarui</h4>
                          <p className="text-sm text-amber-700">
                            Klik item untuk melihat detail produk.
                          </p>
                        </div>
                        {updatedItemsOpen ? (
                          <ChevronDown className="w-5 h-5 text-amber-700 shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-amber-700 shrink-0" />
                        )}
                      </button>

                      {updatedItemsOpen && (
                        <div className="border-t border-amber-100 p-3 sm:p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {importResult.updatedProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => handleOpenProduct(product)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-blue-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">{product.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 font-mono truncate">{product.sku}</div>
                                  </div>
                                  <ArrowUpRight className="w-4 h-4 text-blue-600 shrink-0" />
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                                    {product.category.name}
                                  </span>
                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                                    {product.productType}
                                  </span>
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                                    Stok {product.stock.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {previewData.length > 0 && validationErrors.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium text-sm">{previewData.length} baris valid dan siap diimport.</span>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold">Nama</th>
                        <th className="px-4 py-3 font-semibold">Tipe</th>
                        <th className="px-4 py-3 font-semibold">Harga</th>
                        <th className="px-4 py-3 font-semibold">Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 50).map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{row.sku}</td>
                          <td className="px-4 py-3">{row.name}</td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                              {row.productType}
                            </span>
                          </td>
                          <td className="px-4 py-3">{row.price ?? "-"}</td>
                          <td className="px-4 py-3">{row.stock}</td>
                        </tr>
                      ))}
                      {previewData.length > 50 && (
                        <tr className="bg-slate-50 text-center">
                          <td colSpan={5} className="px-4 py-3 italic text-slate-500">
                            Menampilkan 50 baris pertama...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button 
                  onClick={handleImport} 
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md shadow-emerald-600/20 gap-2"
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Mulai Import Sekarang
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <ProductDetailsSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </Dialog>
  );
}
