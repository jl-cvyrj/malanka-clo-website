/** Store-wide constants shared across the app. */

export const DEFAULT_CURRENCY = "BYN";

/**
 * The fixed apparel sizes the store supports. Declaration order is the
 * canonical display/sort order (XS → XXL) and mirrors the backend `SizeCode`
 * enum; the admin UI only offers these, and the backend rejects anything else.
 */
export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type ProductSizeCode = (typeof PRODUCT_SIZES)[number];

/** Canonical index of a size code; unknown codes sort last. */
export function sizeRank(code: string | null | undefined): number {
  if (!code) return PRODUCT_SIZES.length;
  const index = PRODUCT_SIZES.indexOf(code.trim().toUpperCase() as ProductSizeCode);
  return index === -1 ? PRODUCT_SIZES.length : index;
}

/** Comparator for sorting anything that exposes a `sizeCode`. */
export function compareSizes(
  a: { sizeCode: string | null },
  b: { sizeCode: string | null },
): number {
  return sizeRank(a.sizeCode) - sizeRank(b.sizeCode);
}
