package com.malankaclo.backend.order;

import jakarta.validation.constraints.NotNull;

public record OrderStatusRequest(
        @NotNull OrderStatus status
) {
}
