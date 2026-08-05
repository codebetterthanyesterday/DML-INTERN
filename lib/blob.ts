// Shared helpers for working with Vercel Blob URLs. Safe to import from both
// server and client code — contains no secrets, just pure string utilities.

export const PRIVATE_BLOB_HOST_PATTERN = /^https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com\//

/**
 * Our Blob store is provisioned private-access only, so every uploaded file
 * (business documents, product images, etc.) is stored as a private blob and
 * can't be linked to directly from the browser — it 403s without the store's
 * read/write token attached.
 *
 * This converts a raw private blob URL (as stored in the DB) into a same-origin
 * URL that proxies through `/api/images`, which fetches the blob server-side
 * with the token attached. Non-blob URLs (external links, empty values) are
 * returned unchanged so this is always safe to call.
 */
export function toPublicImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (!PRIVATE_BLOB_HOST_PATTERN.test(url)) return url
  return `/api/images?url=${encodeURIComponent(url)}`
}
