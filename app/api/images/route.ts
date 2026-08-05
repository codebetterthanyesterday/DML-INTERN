import { NextResponse } from "next/server"
import { PRIVATE_BLOB_HOST_PATTERN } from "@/lib/blob"

// Vercel Blob private-store URLs require the store's read/write token to be
// fetched — they cannot be linked to directly from the browser. Product
// images must still be publicly viewable on the storefront, so this route
// proxies the request server-side (with the token attached) without any
// auth gate. The blob pathname includes a random suffix, so URLs are
// effectively unguessable and safe to serve publicly + cache aggressively.
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")
  if (!url || !PRIVATE_BLOB_HOST_PATTERN.test(url)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
  }

  const blobRes = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })

  if (!blobRes.ok || !blobRes.body) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }

  return new NextResponse(blobRes.body, {
    headers: {
      "content-type": blobRes.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
