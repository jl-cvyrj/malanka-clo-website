package com.malankaclo.backend.product;

/**
 * The fixed set of apparel sizes the store supports. The declaration order is
 * the canonical display/sort order (XS → XXL) and is applied whenever sizes are
 * exposed through the API (see {@link ProductMapper}).
 */
public enum SizeCode {
    XS, S, M, L, XL, XXL;

    /** Human-readable list used in validation error messages. */
    public static final String ALLOWED = "XS, S, M, L, XL, XXL";

    /** True when {@code code} (case-insensitive, trimmed) is one of the fixed sizes. */
    public static boolean isValid(String code) {
        if (code == null) {
            return false;
        }
        try {
            SizeCode.valueOf(code.trim().toUpperCase());
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    /** Uppercases and trims a size code; returns {@code null} for {@code null}. */
    public static String normalize(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    /**
     * Position of {@code code} in the canonical order. Unknown codes sort last,
     * so legacy data never breaks ordering.
     */
    public static int rank(String code) {
        if (code == null) {
            return Integer.MAX_VALUE;
        }
        try {
            return SizeCode.valueOf(code.trim().toUpperCase()).ordinal();
        } catch (IllegalArgumentException ex) {
            return Integer.MAX_VALUE;
        }
    }
}
