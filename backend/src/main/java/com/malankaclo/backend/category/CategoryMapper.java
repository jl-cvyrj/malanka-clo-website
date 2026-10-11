package com.malankaclo.backend.category;

import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getSortOrder(),
                category.isActive()
        );
    }
}
