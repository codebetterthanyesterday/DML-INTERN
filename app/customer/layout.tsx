import { AuthAwareHeader } from "@/components/shared/AuthAwareHeader"
import { Footer } from "@/components/shared/Footer"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AuthAwareHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  )
}
