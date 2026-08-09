import { auth } from "@/lib/auth"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg", 
  "image/png", 
  "image/webp", 
]
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  const session = await auth()
  
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
        console.log("Complaint media uploaded to Blob:", blob.url)
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
