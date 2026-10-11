package com.malankaclo.backend.order;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItem)
                .toList();

        return new OrderResponse(
                order.getOrderNumber(),
                order.getType(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getCustomerName(),
                order.getPhone(),
                order.getEmail(),
                order.getTelegramUsername(),
                order.getPostalIndex(),
                order.getCountry(),
                order.getCity(),
                order.getAddress(),
                order.getDeliveryMethod(),
                order.getPaymentMethod(),
                order.getSubtotalAmount(),
                order.getShippingAmount(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getComment(),
                order.getCreatedAt(),
                items
        );
    }

    public OrderItemResponse toItem(OrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new OrderItemResponse(
                item.getProductName(),
                item.getSizeCode(),
                item.getQuantity(),
                item.getUnitPrice(),
                lineTotal
        );
    }

    public OrderSummaryResponse toSummary(Order order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                order.getPhone(),
                order.getType(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getCreatedAt(),
                order.getItems().size()
        );
    }
}
