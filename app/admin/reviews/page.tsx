import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewsClient } from "@/components/admin/reviews/ReviewsClient";
import { MessageSquare, Clock } from "lucide-react";

export const metadata = {
  title: "Moderasi Ulasan — DML Admin",
  description: "Manajemen dan moderasi ulasan pelanggan",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

async function ReviewsContent({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const params = await searchParams;
  const statusFilter = params.status;

  const reviews = await prisma.review.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as any } : {}),
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      product: {
        select: { name: true, slug: true },
      },
      order: {
        select: { orderNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = await prisma.review.count({
    where: { status: "PENDING" },
  });

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#fbfbfb] border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ulasan</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reviews.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#fbfbfb] border border-amber-200 border-t-4 border-t-amber-500 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Moderasi</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <ReviewsClient initialReviews={reviews as any} />
    </>
  );
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Moderasi Ulasan</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Tinjau ulasan yang masuk sebelum ditampilkan ke publik.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex flex-col items-center gap-3 text-slate-400">
            <MessageSquare className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat ulasan...</p>
          </div>
        }
      >
        <ReviewsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
