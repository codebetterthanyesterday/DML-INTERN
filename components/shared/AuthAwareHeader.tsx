import { auth } from "@/lib/auth"
import { Header } from "./Header"

/**
 * Server Component wrapper for the Header.
 * Fetches the session on the server side (zero-flash, no loading state)
 * and passes it down as a prop to the client Header component.
 */
export async function AuthAwareHeader() {
  const session = await auth()
  return <Header session={session} />
}
