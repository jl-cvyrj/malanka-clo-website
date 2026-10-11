package com.malankaclo.backend.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        String productName,
        String sizeCode,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}
