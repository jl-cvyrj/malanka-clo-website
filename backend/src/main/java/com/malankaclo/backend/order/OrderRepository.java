package com.malankaclo.backend.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findAllByStatusOrderByCreatedAtDesc(OrderStatus status);

    boolean existsByOrderNumber(String orderNumber);
}
