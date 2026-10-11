package com.malankaclo.backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotNull OrderType type,
        @NotBlank @Size(max = 255) String customerName,
        @NotBlank @Size(max = 50) String phone,
        @Email @Size(max = 255) String email,
        @Size(max = 64)
        @Pattern(regexp = "^(?:@?[A-Za-z0-9_]{5,32})?$",
                message = "must be a valid Telegram username (5-32 letters, digits or underscores)")
        String telegramUsername,
        @Size(max = 20)
        @Pattern(regexp = "^(?:[A-Za-z0-9][A-Za-z0-9 -]{2,19})?$",
                message = "must be a valid postal index (3-20 letters, digits, spaces or dashes)")
        String postalIndex,
        @Size(max = 100) String country,
        @Size(max = 100) String city,
        @Size(max = 500) String address,
        DeliveryMethod deliveryMethod,
        PaymentMethod paymentMethod,
        @Size(max = 2000) String comment,
        @NotEmpty List<@Valid CreateOrderItemRequest> items
) {
}
