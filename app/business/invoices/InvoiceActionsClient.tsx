"use client";

import { useState } from "react";
import { Download, Upload, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentModalClient from "./PaymentModalClient";
import Link from "next/link";

export default function InvoiceActionsClient({ invoiceId, amount, isUnpaid }: { invoiceId: string, amount: number, isUnpaid: boolean }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <div className="flex justify-end gap-2">
        {isUnpaid && (
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => setShowPaymentModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bayar
          </Button>
        )}
        <Button size="sm" variant="outline" asChild>
          <Link href={`/print/invoice/${invoiceId}`} target="_blank">
            <Download className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {showPaymentModal && (
        <PaymentModalClient 
          invoiceId={invoiceId} 
          amount={amount} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </>
  );
}
