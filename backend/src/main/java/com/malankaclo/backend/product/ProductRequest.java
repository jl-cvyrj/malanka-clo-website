package com.malankaclo.backend.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 255) String slug,
        @Size(max = 5000) String description,
        @NotNull @DecimalMin("0.0") @Digits(integer = 12, fraction = 2) BigDecimal price,
        @Size(min = 3, max = 3) String currency
) {
}
