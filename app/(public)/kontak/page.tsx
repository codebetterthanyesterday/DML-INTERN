import { auth } from "@/lib/auth"
import { getKontakPageContent } from "@/app/actions/cms"
import { KontakPageClient } from "./KontakPageClient"
import { CmsKontakEditorSheet } from "@/components/cms/cms-kontak-editor-sheet"

export default async function KontakPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const cmsData = await getKontakPageContent()

  return (
    <>
      <KontakPageClient
        session={session}
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? null}
        cmsData={cmsData}
      />
      {isAdmin && <CmsKontakEditorSheet initialData={cmsData} />}
    </>
  )
}
