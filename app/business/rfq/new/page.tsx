"use client";

import { useState } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Dummy data for example
const initialItems = [
  { id: 1, productName: "Rubber Sheet SBR", qty: 500, unit: "meter" }
];

export default function NewRFQPage() {
  const [items, setItems] = useState(initialItems);

  const addItem = () => {
    setItems([...items, { id: Date.now(), productName: "", qty: 1, unit: "pcs" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buat Request For Quote (RFQ)</h1>
        <p className="text-slate-500 mt-1">Ajukan penawaran harga khusus untuk kebutuhan industrial Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk Diajukan</CardTitle>
              <CardDescription>Pilih produk dan tentukan kuantitas yang dibutuhkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6 space-y-1.5">
                        <Label htmlFor={`product-${item.id}`}>Nama Produk</Label>
                        <Input id={`product-${item.id}`} defaultValue={item.productName} placeholder="Misal: Rubber Sheet SBR" />
                      </div>
                      <div className="md:col-span-3 space-y-1.5">
                        <Label htmlFor={`qty-${item.id}`}>Kuantitas</Label>
                        <Input id={`qty-${item.id}`} type="number" defaultValue={item.qty} />
                      </div>
                      <div className="md:col-span-3 space-y-1.5">
                        <Label htmlFor={`unit-${item.id}`}>Satuan</Label>
                        <Input id={`unit-${item.id}`} defaultValue={item.unit} placeholder="pcs/meter/kg" />
                      </div>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-red-500 mt-6 shrink-0" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-2" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Lain
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan & Spesifikasi Custom</CardTitle>
              <CardDescription>Jelaskan spesifikasi teknis tambahan jika diperlukan.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Misalnya: Mohon penawaran untuk ketebalan 5mm dengan ukuran 2x2 meter per lembarnya..." 
                className="min-h-[120px]"
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
                <p className="font-medium text-slate-900">CV. Maju Jaya (Contoh)</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Status NPWP</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Terverifikasi</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-slate-500">PIC Pemesan</p>
                <p className="font-medium text-slate-900">Bpk. Agus (08333333333)</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-slate-900 hover:bg-slate-800">
                <Send className="h-4 w-4 mr-2" />
                Kirim Permintaan
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
