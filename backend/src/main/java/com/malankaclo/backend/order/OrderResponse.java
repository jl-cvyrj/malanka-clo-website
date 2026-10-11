package com.malankaclo.backend.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String orderNumber,
        OrderType type,
        OrderStatus status,
        PaymentStatus paymentStatus,
        String customerName,
        String phone,
        String email,
        String telegramUsername,
        String postalIndex,
        String country,
        String city,
        String address,
        DeliveryMethod deliveryMethod,
        PaymentMethod paymentMethod,
        BigDecimal subtotalAmount,
        BigDecimal shippingAmount,
        BigDecimal totalAmount,
        String currency,
        String comment,
        Instant createdAt,
        List<OrderItemResponse> items
) {
}
