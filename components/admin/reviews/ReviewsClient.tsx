"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Star, CheckCircle, XCircle, Clock } from "lucide-react";
import { toPublicImageUrl } from "@/lib/blob";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  user: { name: string; email: string };
  product: { name: string; slug: string };
  order: { orderNumber: string } | null;
  mediaUrls: string[];
};

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(`Review ${newStatus.toLowerCase()} successfully`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update review status");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Produk & Pelanggan</th>
              <th className="px-6 py-4">Ulasan</th>
              <th className="px-6 py-4 w-32">Status</th>
              <th className="px-6 py-4 w-40 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  Belum ada ulasan yang ditemukan.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-slate-900">{review.product.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Oleh: <span className="font-medium text-slate-700">{review.user.name}</span>
                    </p>
                    {review.order && (
                      <p className="text-xs text-slate-400 mt-0.5">Order: {review.order.orderNumber}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap mb-3">
                      {review.comment || <span className="italic text-slate-400">Tidak ada komentar</span>}
                    </p>
                    
                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {review.mediaUrls.map((url, i) => {
                          const publicUrl = toPublicImageUrl(url);
                          if (!publicUrl) return null;
                          return (
                            <a 
                              key={i} 
                              href={publicUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-16 h-16 rounded-md border border-slate-200 overflow-hidden bg-slate-50 relative group block"
                            >
                              {publicUrl.includes(".mp4") || publicUrl.includes(".webm") ? (
                                <video src={publicUrl} className="w-full h-full object-cover" />
                              ) : (
                                <img src={publicUrl} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              )}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        review.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : review.status === "REJECTED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {review.status === "APPROVED" && <CheckCircle className="w-3.5 h-3.5" />}
                      {review.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                      {review.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    {review.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(review.id, "APPROVED")}
                          disabled={isUpdating === review.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm disabled:opacity-50 transition-colors"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(review.id, "REJECTED")}
                          disabled={isUpdating === review.id}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md shadow-sm disabled:opacity-50 transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
