import { auth } from "@/lib/auth"
import { KontakPageClient } from "./KontakPageClient"

export default async function KontakPage() {
  const session = await auth()
  return (
    <KontakPageClient
      session={session}
      userName={session?.user?.name ?? null}
      userEmail={session?.user?.email ?? null}
    />
  )
}
