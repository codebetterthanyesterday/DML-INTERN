import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Star, CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toPublicImageUrl } from "@/lib/blob";

export const metadata = {
  title: "Ulasan Saya — DML",
  description: "Daftar ulasan produk yang pernah Anda berikan",
};

async function CustomerReviewsContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { name: true, slug: true },
      },
      order: {
        select: { orderNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Ulasan</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Anda belum memberikan ulasan untuk produk apapun.
        </p>
        <Link href="/customer/orders" className="inline-flex items-center px-4 py-2 bg-blue-950 text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors">
          Cek Pesanan Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:bg-slate-50/50 transition-colors">
            <div className="sm:w-1/3 flex flex-col gap-2">
              <Link href={`/katalog/${review.product.slug}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                {review.product.name}
              </Link>
              {review.order && (
                <p className="text-xs font-semibold text-slate-500">Order: {review.order.orderNumber}</p>
              )}
              <p className="text-xs text-slate-400">
                {review.createdAt.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="sm:w-2/3 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
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
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                {review.comment ? review.comment : <span className="italic text-slate-400">Tidak ada komentar tambahan.</span>}
                
                {review.mediaUrls && review.mediaUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {review.mediaUrls.map((url: string, i: number) => {
                      const publicUrl = toPublicImageUrl(url);
                      if (!publicUrl) return null;
                      return (
                        <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-slate-200 overflow-hidden bg-white">
                          {publicUrl.includes(".mp4") || publicUrl.includes(".webm") ? (
                            <video src={publicUrl} className="w-full h-full object-cover" />
                          ) : (
                            <img src={publicUrl} alt="Lampiran ulasan" className="w-full h-full object-cover" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {review.status === "REJECTED" && (
                <p className="text-xs font-medium text-red-500 mt-2">
                  Ulasan ini ditolak oleh moderator karena melanggar panduan komunitas.
                </p>
              )}
              {review.status === "PENDING" && (
                <p className="text-xs font-medium text-amber-500 mt-2">
                  Ulasan Anda sedang ditinjau oleh tim kami sebelum ditampilkan ke publik.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Ulasan Saya</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Daftar ulasan yang pernah Anda berikan untuk produk kami.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex flex-col items-center gap-3 text-slate-400">
            <MessageSquare className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat ulasan...</p>
          </div>
        }
      >
        <CustomerReviewsContent />
      </Suspense>
    </div>
  );
}
