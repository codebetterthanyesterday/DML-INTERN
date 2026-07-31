import { AuthAwareHeader } from "@/components/shared/AuthAwareHeader"
import { Footer } from "@/components/shared/Footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthAwareHeader />
      {children}
      <Footer />
    </>
  )
}
