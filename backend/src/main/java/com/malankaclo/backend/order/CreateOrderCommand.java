package com.malankaclo.backend.order;

import java.util.List;

public record CreateOrderCommand(
        OrderType type,
        String customerName,
        String phone,
        String email,
        String country,
        String city,
        String address,
        DeliveryMethod deliveryMethod,
        PaymentMethod paymentMethod,
        String comment,
        List<CreateOrderItemCommand> items
) {
}
