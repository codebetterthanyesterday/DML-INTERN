"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Star, MessageSquare, ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReviewSubmissionFormProps {
  productId: string;
  orderId: string;
  productName: string;
}

export function ReviewSubmissionForm({
  productId,
  orderId,
  productName,
}: ReviewSubmissionFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (mediaFiles.length + selected.length > 3) {
        toast.error("Maksimal 3 foto/video.");
        return;
      }
      // check max size 50MB
      const oversized = selected.find((f) => f.size > 50 * 1024 * 1024);
      if (oversized) {
        toast.error("Ukuran file maksimal 50MB.");
        return;
      }
      setMediaFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Silakan berikan rating (1-5 bintang)");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload media
      const mediaUrls: string[] = [];
      for (const file of mediaFiles) {
        const uniqueFilename = `review-media/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        const blob = await upload(uniqueFilename, file, {
          access: "private",
          handleUploadUrl: "/api/blob/review-media",
        });
        mediaUrls.push(blob.url);
      }

      // 2. Submit review
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          comment,
          mediaUrls,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal mengirim ulasan");
      }

      toast.success("Ulasan berhasil dikirim! Menunggu moderasi.");
      setOpen(false);
      // Reset form
      setRating(0);
      setComment("");
      setMediaFiles([]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto text-xs h-8">
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
          Beri Ulasan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Beri Ulasan Produk</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-bold text-slate-900 mb-4">{productName}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="comment" className="text-sm font-semibold text-slate-700">
                Komentar (Opsional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Bagaimana kualitas produk ini?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Lampiran (Opsional, Max 3 Foto/Video)
              </label>
              
              {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-2">
                  {mediaFiles.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                      {file.type.startsWith("image/") ? (
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      )}
                      <button 
                        type="button" 
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {mediaFiles.length < 3 && (
                <label className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700 font-semibold text-sm">
                  <ImagePlus className="w-5 h-5" />
                  Tambah Foto / Video
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp, video/mp4, video/webm" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-950 text-white hover:bg-blue-900"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Ulasan"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
