package com.malankaclo.backend.product;

public record ProductSizeResponse(
        Long id,
        String sizeCode,
        boolean available
) {
}
