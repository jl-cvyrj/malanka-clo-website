package com.malankaclo.backend.order;

import jakarta.validation.constraints.NotNull;

public record OrderPaymentStatusRequest(
        @NotNull PaymentStatus paymentStatus
) {
}
