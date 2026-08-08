"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function CopyTrackingButton({ trackingNumber }: { trackingNumber: string }) {
  const [copied, setCopied] = useState(false);

  const copyTrackingNumber = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy tracking number failed:", error);
      toast.error("Nomor resi tidak dapat disalin.");
    }
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-white p-2 pl-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor resi</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="font-mono text-sm font-extrabold text-slate-950">{trackingNumber}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-indigo-600"
          onClick={copyTrackingNumber}
          aria-label="Salin nomor resi"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
