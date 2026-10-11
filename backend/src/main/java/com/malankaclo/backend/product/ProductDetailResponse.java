package com.malankaclo.backend.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        String currency,
        String categoryName,
        String categorySlug,
        boolean active,
        List<ProductImageResponse> images,
        List<ProductSizeResponse> sizes
) {
}
