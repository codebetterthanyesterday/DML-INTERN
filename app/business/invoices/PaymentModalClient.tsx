"use client";

import { useState } from "react";
import { CreditCard, Upload, X, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { payInvoiceXendit, uploadManualPaymentProof } from "@/lib/actions/b2b";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PaymentModalClient({ invoiceId, amount, onClose }: { invoiceId: string, amount: number, onClose: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  const handleXenditPayment = async () => {
    try {
      setIsProcessing(true);
      const res = await payInvoiceXendit(invoiceId);
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (error: any) {
      alert(error.message || "Gagal memproses pembayaran");
      setIsProcessing(false);
    }
  };

  const handleManualUpload = async () => {
    if (!proofUrl.trim()) {
      alert("Harap masukkan URL bukti transfer (misalnya link Google Drive atau layanan upload).");
      return;
    }
    
    try {
      setIsProcessing(true);
      const res = await uploadManualPaymentProof(invoiceId, proofUrl);
      if (res.success) {
        alert("Bukti pembayaran berhasil diunggah dan sedang diverifikasi.");
        onClose();
      }
    } catch (error: any) {
      alert(error.message || "Gagal mengunggah bukti pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Pilih Metode Pembayaran</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
            <p className="text-sm text-slate-500 mb-1">Total Tagihan</p>
            <p className="text-2xl font-bold text-slate-900">Rp {amount.toLocaleString("id-ID")}</p>
          </div>

          <Tabs defaultValue="xendit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="xendit">Otomatis (Xendit)</TabsTrigger>
              <TabsTrigger value="manual">Transfer Manual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="xendit" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p>Mendukung Virtual Account, Kartu Kredit, E-Wallet, dan QRIS.</p>
                </div>
                <div className="flex gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p>Verifikasi instan tanpa perlu konfirmasi manual.</p>
                </div>
                
                <Button 
                  onClick={handleXenditPayment} 
                  disabled={isProcessing}
                  className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isProcessing ? "Memproses..." : "Bayar Sekarang via Xendit"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <p className="font-semibold text-slate-900 mb-2">Silakan transfer ke rekening berikut:</p>
                <div className="space-y-1">
                  <p><span className="text-slate-500">Bank:</span> BCA</p>
                  <p><span className="text-slate-500">No. Rekening:</span> 1234567890</p>
                  <p><span className="text-slate-500">Atas Nama:</span> PT Duta Mitra Luhur</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proofUrl">Link Bukti Transfer</Label>
                <Input 
                  id="proofUrl"
                  placeholder="Paste link gambar/PDF bukti transfer di sini..." 
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  disabled={isProcessing}
                />
                <p className="text-xs text-slate-500">Anda dapat menggunakan Google Drive, Dropbox, dsb.</p>
              </div>
              
              <Button 
                onClick={handleManualUpload} 
                disabled={isProcessing}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isProcessing ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
