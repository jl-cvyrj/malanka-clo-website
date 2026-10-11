package com.malankaclo.backend.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductSizeRequest(
        @NotBlank @Size(max = 20) String sizeCode,
        Boolean available
) {
}
