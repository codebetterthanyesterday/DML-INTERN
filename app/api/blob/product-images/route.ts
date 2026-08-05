import { auth } from "@/lib/auth"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 // 8MB — product photography
const PRIVATE_BLOB_HOST_PATTERN = /^https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com\//

// Mints short-lived, scoped upload tokens so product images can be sent
// directly from the browser to Vercel Blob (bypassing the Server Action body
// size limit entirely). Only admins may manage the product catalog, so
// token generation is gated behind an authenticated ADMIN/SUPER_ADMIN session.
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Product image uploaded to Blob:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Blob upload token error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Gagal memproses upload." },
      { status: 400 }
    )
  }
}

// Deletes a product image blob. Used both when an admin removes an image
// still in the upload staging area (before the product form is submitted)
// and when reconciling images on product update (see lib/actions/products.ts).
export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url).searchParams.get("url")
  if (!url || !PRIVATE_BLOB_HOST_PATTERN.test(url)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
  }

  const { del } = await import("@vercel/blob")
  try {
    await del(url)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blob delete error:", error)
    return NextResponse.json({ error: "Gagal menghapus gambar." }, { status: 500 })
  }
}
