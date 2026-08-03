"use client";

import { useState } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitRfq } from "@/lib/actions/b2b";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  unit: string;
};

type UserInfo = {
  companyName: string | null;
  npwp: string | null;
  name: string;
  phone: string | null;
};

export default function RfqFormClient({ products, user }: { products: Product[], user: UserInfo }) {
  const router = useRouter();
  const [items, setItems] = useState([{ id: Date.now(), productId: "", qtyRequested: 1, notes: "" }]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: "", qtyRequested: 1, notes: "" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleProductChange = (id: number, productId: string) => {
    setItems(items.map(item => item.id === id ? { ...item, productId } : item));
  };

  const handleQtyChange = (id: number, qtyRequested: number) => {
    setItems(items.map(item => item.id === id ? { ...item, qtyRequested } : item));
  };

  const handleNotesChange = (id: number, notes: string) => {
    setItems(items.map(item => item.id === id ? { ...item, notes } : item));
  };

  const handleSubmit = async () => {
    // Validate
    const invalidItems = items.filter(i => !i.productId || i.qtyRequested < 1);
    if (invalidItems.length > 0) {
      alert("Mohon lengkapi semua baris produk yang dipilih beserta kuantitasnya.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = items.map(i => ({
        productId: i.productId,
        qtyRequested: Number(i.qtyRequested),
        notes: i.notes
      }));
      
      const res = await submitRfq(payload, customerNotes);
      if (res.success) {
        router.push("/business/rfq");
      }
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat mengirim RFQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk Diajukan</CardTitle>
            <CardDescription>Pilih produk dan tentukan kuantitas yang dibutuhkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              return (
                <div key={item.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6 space-y-1.5">
                        <Label>Nama Produk</Label>
                        <Select value={item.productId} onValueChange={(val) => handleProductChange(item.id, val)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Pilih Produk..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3 space-y-1.5">
                        <Label>Kuantitas</Label>
                        <Input 
                          type="number" 
                          min="1"
                          value={item.qtyRequested} 
                          onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1.5">
                        <Label>Satuan</Label>
                        <Input 
                          value={selectedProduct?.unit || "-"} 
                          disabled 
                          className="bg-slate-100 text-slate-500" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <Label className="text-xs text-slate-500">Catatan Khusus (Opsional)</Label>
                      <Input 
                        placeholder="Misal: Ukuran custom 2x2m, ketebalan 5mm" 
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="bg-white h-8 text-sm"
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-red-500 mt-6 shrink-0" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
            
            <Button variant="outline" className="w-full mt-2" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk Lain
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan Umum Pengajuan</CardTitle>
            <CardDescription>Jelaskan detail pengiriman atau penawaran yang Anda harapkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Misalnya: Tolong buatkan penawaran sudah termasuk ongkos kirim ke pabrik kami..." 
              className="min-h-[120px]"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Nama Perusahaan</p>
              <p className="font-medium text-slate-900">{user.companyName || "-"}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Status NPWP</p>
              <div className="flex items-center gap-2">
                {user.npwp ? (
                  <>
                    <span className="font-medium text-slate-900">Terlampir</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-slate-500">Belum Ada</span>
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  </>
                )}
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm text-slate-500">PIC Pemesan</p>
              <p className="font-medium text-slate-900">{user.name} {user.phone ? `(${user.phone})` : ""}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Mengirim..." : "Kirim Permintaan"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
