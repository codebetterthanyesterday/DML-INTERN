import { auth } from "@/lib/auth"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg", 
  "image/png", 
  "image/webp", 
  "video/mp4", 
  "video/webm"
]
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB — for photo & short video reviews
const PRIVATE_BLOB_HOST_PATTERN = /^https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com\//

export async function POST(request: Request) {
  const session = await auth()
  
  // Both CUSTOMER and BUSINESS can upload review media
  if (!session?.user?.id) {
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
        console.log("Review media uploaded to Blob:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("Blob upload token error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Gagal memproses upload media." },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url).searchParams.get("url")
  if (!url || !PRIVATE_BLOB_HOST_PATTERN.test(url)) {
    return NextResponse.json({ error: "Invalid media URL" }, { status: 400 })
  }

  const { del } = await import("@vercel/blob")
  try {
    await del(url)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blob delete error:", error)
    return NextResponse.json({ error: "Gagal menghapus media." }, { status: 500 })
  }
}
