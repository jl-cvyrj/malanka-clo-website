package com.malankaclo.backend.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductSummaryResponse(
        Long id,
        String name,
        String slug,
        BigDecimal price,
        String currency,
        String categoryName,
        String categorySlug,
        String primaryImageUrl,
        List<String> availableSizes,
        boolean active
) {
}
