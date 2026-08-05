import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Vercel Blob private-store URLs require the store's read/write token to be
// fetched — they cannot be linked to directly from the browser. This route
// proxies the request server-side (with the token attached) so admins can
// still view business verification documents, without ever exposing the
// token to the client.
const PRIVATE_BLOB_HOST_PATTERN = /^https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com\//

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url).searchParams.get("url")
  if (!url || !PRIVATE_BLOB_HOST_PATTERN.test(url)) {
    return NextResponse.json({ error: "Invalid document URL" }, { status: 400 })
  }

  const blobRes = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })

  if (!blobRes.ok || !blobRes.body) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  return new NextResponse(blobRes.body, {
    headers: {
      "content-type": blobRes.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": blobRes.headers.get("content-disposition") ?? "inline",
    },
  })
}
