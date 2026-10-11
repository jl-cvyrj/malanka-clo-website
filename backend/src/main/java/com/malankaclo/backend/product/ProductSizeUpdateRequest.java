package com.malankaclo.backend.product;

import jakarta.validation.constraints.NotNull;

public record ProductSizeUpdateRequest(
        @NotNull Boolean available
) {
}
