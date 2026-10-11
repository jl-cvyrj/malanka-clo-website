package com.malankaclo.backend.order;

import com.malankaclo.backend.common.web.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private static final int MAX_PAGE_SIZE = 100;

    private final OrderService orderService;

    @GetMapping
    public PageResponse<OrderSummaryResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int clamped = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        return orderService.findPage(status, PageRequest.of(Math.max(0, page), clamped));
    }

    @GetMapping("/{id}")
    public OrderResponse detail(@PathVariable Long id) {
        return orderService.findDetail(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusRequest request) {
        orderService.updateStatus(id, request.status());
        return orderService.findDetail(id);
    }

    @PatchMapping("/{id}/payment-status")
    public OrderResponse updatePaymentStatus(@PathVariable Long id,
                                             @Valid @RequestBody OrderPaymentStatusRequest request) {
        orderService.updatePaymentStatus(id, request.paymentStatus());
        return orderService.findDetail(id);
    }
}
