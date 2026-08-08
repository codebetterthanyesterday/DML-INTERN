import { Suspense } from "react"
import { getAdminVouchers } from "@/lib/actions/vouchers"
import { VouchersClient } from "@/components/admin/vouchers/VouchersClient"
import { Gift } from "lucide-react"

export const metadata = {
  title: "Kode Voucher — DML Admin",
  description: "Manajemen kode voucher dan promo pelanggan",
}

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

const PAGE_SIZE = 20

async function VouchersContent({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10))

  const { vouchers, total } = await getAdminVouchers(q, page, PAGE_SIZE)

  return (
    <VouchersClient 
      vouchers={vouchers}
      total={total}
      currentQ={q}
      currentPage={page}
      pageSize={PAGE_SIZE}
    />
  )
}

export default async function AdminVouchersPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Kode Voucher</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Buat dan kelola kode promo untuk pelanggan B2C.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-10 sm:p-16 flex flex-col items-center gap-3 text-slate-400">
            <Gift className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat data voucher...</p>
          </div>
        }
      >
        <VouchersContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
