package com.malankaclo.backend.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductImageRequest(
        @NotBlank @Size(max = 1000) String url,
        @Size(max = 255) String altText,
        @Min(0) Integer sortOrder
) {
}
