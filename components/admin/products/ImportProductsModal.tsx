"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { importProducts } from "@/lib/actions/import";
import { importProductRowSchema, ImportProductRow } from "@/lib/validations/import";

export function ImportProductsModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ImportProductRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
    }
  };

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
      
      if (res.errors && res.errors.length > 0) {
        toast.error(`Berhasil import ${res.success}. Gagal ${res.failed}.`);
        setValidationErrors(res.errors);
      } else {
        toast.success(`Berhasil mengimport ${res.success} produk!`);
        resetModal();
        router.refresh();
      }
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-48 overflow-y-auto">
              <h4 className="font-semibold text-red-800 mb-2">Ditemukan Kesalahan:</h4>
              <ul className="text-sm text-red-600 space-y-1 list-disc pl-5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
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
    </Dialog>
  );
}
