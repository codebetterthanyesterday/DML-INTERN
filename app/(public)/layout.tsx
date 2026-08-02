import { AuthAwareHeader } from "@/components/shared/AuthAwareHeader"
import { Footer } from "@/components/shared/Footer"
import { auth } from "@/lib/auth"
import { getSharedComponentsContent } from "@/app/actions/cms"
import { CmsSharedEditorSheet } from "@/components/cms/cms-shared-editor-sheet"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const cmsData = await getSharedComponentsContent()

  return (
    <>
      <AuthAwareHeader headerCmsData={cmsData.header} />
      {children}
      <Footer cmsData={cmsData.footer} />
      {isAdmin && <CmsSharedEditorSheet initialData={cmsData} />}
    </>
  )
}
