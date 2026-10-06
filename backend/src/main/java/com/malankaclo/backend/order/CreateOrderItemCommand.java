package com.malankaclo.backend.order;

public record CreateOrderItemCommand(
        Long productId,
        String sizeCode,
        int quantity
) {
}
