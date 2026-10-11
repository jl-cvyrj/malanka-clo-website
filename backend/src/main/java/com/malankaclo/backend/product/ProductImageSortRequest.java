package com.malankaclo.backend.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProductImageSortRequest(
        @NotNull @Min(0) Integer sortOrder
) {
}
