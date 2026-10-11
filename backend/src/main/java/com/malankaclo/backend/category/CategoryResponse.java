package com.malankaclo.backend.category;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        Integer sortOrder,
        boolean active
) {
}
