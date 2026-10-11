package com.malankaclo.backend.product;

public record ProductImageResponse(
        Long id,
        String url,
        String altText,
        Integer sortOrder
) {
}
