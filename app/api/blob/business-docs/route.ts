import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_DOC_TYPES = ["NPWP", "SIUP"]

// Mints short-lived, scoped upload tokens so business registration documents
// can be sent directly from the browser to Vercel Blob (bypassing the
// Server Action / Vercel Function request body size limit entirely).
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let docType: string | undefined
        try {
          docType = clientPayload ? JSON.parse(clientPayload).docType : undefined
        } catch {
          docType = undefined
        }

        if (!docType || !ALLOWED_DOC_TYPES.includes(docType)) {
          throw new Error("Jenis dokumen tidak valid.")
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ docType }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // No DB write here: the document isn't linked to a user yet at this
        // point (registration form hasn't been submitted). We just log for
        // observability; the actual BusinessDocument row is created by
        // registerBusinessAction once the form is submitted with this URL.
        console.log("Business document uploaded to Blob:", blob.url, tokenPayload)
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
