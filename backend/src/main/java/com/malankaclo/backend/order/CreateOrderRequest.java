package com.malankaclo.backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotNull OrderType type,
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Size(max = 50) String phone,
        @Email @Size(max = 255) String email,
        @Size(max = 100) String country,
        @Size(max = 100) String city,
        @Size(max = 500) String address,
        DeliveryMethod deliveryMethod,
        PaymentMethod paymentMethod,
        @Size(max = 2000) String comment,
        @NotEmpty List<@Valid CreateOrderItemRequest> items
) {
}
