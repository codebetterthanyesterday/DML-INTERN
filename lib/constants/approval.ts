/**
 * Shared constants for the Quotation Approval workflow.
 * This file is intentionally NOT a server action file so it can be
 * imported by both Server Components and Client Components.
 */

/** Minimum transaction value (in IDR) that requires Super Admin approval. */
export const HIGH_VALUE_THRESHOLD = 50_000_000; // Rp 50.000.000
