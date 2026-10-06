package com.malankaclo.backend.order;

import com.malankaclo.backend.common.exception.BusinessException;
import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import com.malankaclo.backend.product.Product;
import com.malankaclo.backend.product.ProductRepository;
import com.malankaclo.backend.product.ProductSize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderCommand command) {
        validateCommand(command);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setType(command.type());
        order.setCustomerName(command.customerName().trim());
        order.setPhone(command.phone().trim());
        order.setEmail(blankToNull(command.email()));
        order.setCountry(blankToNull(command.country()));
        order.setCity(blankToNull(command.city()));
        order.setAddress(blankToNull(command.address()));
        order.setDeliveryMethod(command.deliveryMethod());
        order.setPaymentMethod(command.paymentMethod());
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setComment(blankToNull(command.comment()));
        order.setCurrency("BYN");

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderItemCommand itemCommand : command.items()) {
            Product product = productRepository.findByIdAndActiveTrue(itemCommand.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: " + itemCommand.productId()));

            ProductSize selectedSize = product.getSizes().stream()
                    .filter(size -> size.getSizeCode().equalsIgnoreCase(itemCommand.sizeCode()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(
                            "Size not found for product " + product.getId() + ": " + itemCommand.sizeCode()));

            if (!selectedSize.isAvailable()) {
                throw new BusinessException(
                        "Size is unavailable for product " + product.getId() + ": " + itemCommand.sizeCode());
            }

            BigDecimal itemSubtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemCommand.quantity()));
            subtotal = subtotal.add(itemSubtotal);

            order.addItem(new OrderItem(
                    product,
                    product.getName(),
                    selectedSize.getSizeCode(),
                    itemCommand.quantity(),
                    product.getPrice()
            ));
        }

        order.setSubtotalAmount(subtotal);
        
        // For a standard order, we currently treat the total as equal to the subtotal.
        // Shipping costs can be added as a separate step once the exact
        // business logic for Belpochta/Europochta rates is available.
        if (command.type() == OrderType.DOMESTIC) {
            order.setShippingAmount(BigDecimal.ZERO);
            order.setTotalAmount(subtotal);
        }

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> findAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findAllByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Transactional
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = findById(id);
        order.setStatus(status);
        return order;
    }

    @Transactional
    public Order updatePaymentStatus(Long id, PaymentStatus paymentStatus) {
        Order order = findById(id);
        order.setPaymentStatus(paymentStatus);
        return order;
    }

    private void validateCommand(CreateOrderCommand command) {
        if (command == null) {
            throw new BusinessException("Order command must not be null");
        }
        if (command.type() == null) {
            throw new BusinessException("Order type is required");
        }
        if (isBlank(command.customerName())) {
            throw new BusinessException("Customer name is required");
        }
        if (isBlank(command.phone())) {
            throw new BusinessException("Phone is required");
        }
        if (command.items() == null || command.items().isEmpty()) {
            throw new BusinessException("Order must contain at least one item");
        }

        if (command.type() == OrderType.DOMESTIC) {
            if (isBlank(command.city()) || isBlank(command.address())) {
                throw new BusinessException("City and address are required for a domestic order");
            }
            if (command.deliveryMethod() == null) {
                throw new BusinessException("Delivery method is required for a domestic order");
            }
            if (command.paymentMethod() == null) {
                throw new BusinessException("Payment method is required for a domestic order");
            }
        }

        for (CreateOrderItemCommand item : command.items()) {
            if (item.productId() == null) {
                throw new BusinessException("Product id is required");
            }
            if (isBlank(item.sizeCode())) {
                throw new BusinessException("Size is required");
            }
            if (item.quantity() <= 0) {
                throw new BusinessException("Quantity must be greater than zero");
            }
        }
    }

    private String generateOrderNumber() {
        String prefix = "MLK-" + LocalDate.now() + "-";
        String suffix;
        do {
            suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (orderRepository.existsByOrderNumber(prefix + suffix));
        return prefix + suffix;
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
