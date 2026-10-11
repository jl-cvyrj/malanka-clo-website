package com.malankaclo.backend.order;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryResponse(
        Long id,
        String orderNumber,
        String customerName,
        String phone,
        OrderType type,
        OrderStatus status,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        String currency,
        Instant createdAt,
        int itemCount
) {
}
