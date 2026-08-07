"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { respondToQuote } from "@/lib/actions/b2b";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function QuoteResponseClient({ quoteId }: { quoteId: string }) {
  const [notes, setNotes]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"ACCEPT" | "REJECT" | null>(null);
  const router = useRouter();

  const handleActionClick = (action: "ACCEPT" | "REJECT") => {
    if (action === "REJECT" && !notes.trim()) {
      toast.error("Mohon berikan alasan penolakan pada catatan tambahan.");
      return;
    }
    setPendingAction(action);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      setIsLoading(true);
      const res = await respondToQuote(quoteId, pendingAction, notes);
      if (res.success) {
        if (pendingAction === "ACCEPT") {
          toast.success("Penawaran disetujui! Invoice telah diterbitkan.", {
            icon: "✅",
            style: {
              borderRadius: "10px",
              background: "#10b981",
              color: "#fff",
            },
          });
          // Refresh page data then navigate to invoices
          router.refresh();
          router.push("/business/invoices");
        } else {
          toast.success("Penawaran telah ditolak.");
          // Refresh so the server component re-renders with REJECTED status
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Catatan tambahan untuk admin (opsional)"
        className="min-h-[100px] text-sm"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={isLoading}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold"
          onClick={() => handleActionClick("ACCEPT")}
          disabled={isLoading}
        >
          {isLoading && pendingAction === "ACCEPT" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          )}
          Setujui &amp; Lanjut Invoice
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => handleActionClick("REJECT")}
          disabled={isLoading}
        >
          {isLoading && pendingAction === "REJECT" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4 mr-2" />
          )}
          Tolak Penawaran
        </Button>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Konfirmasi {pendingAction === "ACCEPT" ? "Persetujuan" : "Penolakan"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "ACCEPT"
                ? "Apakah Anda yakin ingin menyetujui penawaran ini? Invoice akan langsung diterbitkan secara otomatis."
                : "Apakah Anda yakin ingin menolak penawaran ini? Proses ini tidak dapat dibatalkan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmAction();
              }}
              disabled={isLoading}
              className={
                pendingAction === "ACCEPT"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ya, Lanjutkan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
