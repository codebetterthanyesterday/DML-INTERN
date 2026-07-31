import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Header } from "./Header"

/**
 * Server Component wrapper for the Header.
 * Fetches the session on the server side (zero-flash, no loading state)
 * and passes it down as a prop to the client Header component.
 */
export async function AuthAwareHeader() {
  const session = await auth()
  
  let cartItemCount = 0
  
  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { items: true } } }
    })
    cartItemCount = cart?._count?.items || 0
  }
  
  return <Header session={session} cartItemCount={cartItemCount} />
}
