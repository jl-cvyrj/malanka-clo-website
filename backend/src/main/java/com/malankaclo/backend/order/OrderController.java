package com.malankaclo.backend.order;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        CreateOrderCommand command = new CreateOrderCommand(
                request.type(),
                request.customerName(),
                request.phone(),
                request.email(),
                request.country(),
                request.city(),
                request.address(),
                request.deliveryMethod(),
                request.paymentMethod(),
                request.comment(),
                request.items().stream()
                        .map(item -> new CreateOrderItemCommand(item.productId(), item.sizeCode(), item.quantity()))
                        .toList()
        );

        Order order = orderService.createOrder(command);
        return orderService.findDetail(order.getId());
    }
}
