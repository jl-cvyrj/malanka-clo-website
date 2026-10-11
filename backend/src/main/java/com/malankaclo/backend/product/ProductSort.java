package com.malankaclo.backend.product;

import com.malankaclo.backend.common.exception.BusinessException;
import org.springframework.data.domain.Sort;

import java.util.Locale;

/**
 * Whitelisted sorting options for the public catalog. Unknown values are rejected
 * instead of being passed through to Spring Data.
 */
public enum ProductSort {
    NEWEST,
    PRICE_ASC,
    PRICE_DESC,
    NAME_ASC;

    public Sort toSort() {
        return switch (this) {
            case NEWEST -> Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
            case PRICE_ASC -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            case PRICE_DESC -> Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            case NAME_ASC -> Sort.by(Sort.Direction.ASC, "name").and(Sort.by(Sort.Direction.ASC, "id"));
        };
    }

    public static ProductSort from(String value) {
        if (value == null || value.isBlank()) {
            return NEWEST;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Unsupported sort option: " + value);
        }
    }
}
