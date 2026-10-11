package com.malankaclo.backend.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderItemRequest(
        @NotNull Long productId,
        @NotBlank @jakarta.validation.constraints.Size(max = 20) String sizeCode,
        @Min(1) int quantity
) {
}
