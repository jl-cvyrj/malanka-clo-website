package com.malankaclo.backend.order;

import com.malankaclo.backend.AbstractIntegrationTest;
import com.malankaclo.backend.category.Category;
import com.malankaclo.backend.category.CategoryRepository;
import com.malankaclo.backend.product.Product;
import com.malankaclo.backend.product.ProductRepository;
import com.malankaclo.backend.product.ProductSize;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class OrderServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void createsDomesticOrderUsingServerSidePriceAndAvailability() {
        Category category = categoryRepository.save(
                new Category("Test category", "test-category", 99));

        Product product = new Product(
                category, "Test Tee", "test-tee", "desc", new BigDecimal("49.99"), "BYN");
        product.addSize(new ProductSize("M", true));
        Product savedProduct = productRepository.save(product);

        CreateOrderCommand command = new CreateOrderCommand(
                OrderType.DOMESTIC,
                "  Іван  ",
                "+375291234567",
                "  ",
                "@ivan_test",
                "220000",
                "Беларусь",
                "Мінск",
                "вул. Леніна 1",
                DeliveryMethod.BELPOST,
                PaymentMethod.FULL_PREPAYMENT,
                null,
                List.of(new CreateOrderItemCommand(savedProduct.getId(), "m", 2)));

        Order order = orderService.createOrder(command);

        assertThat(order.getId()).isNotNull();
        assertThat(order.getOrderNumber()).startsWith("MLK-");
        assertThat(order.getStatus()).isEqualTo(OrderStatus.NEW);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
        assertThat(order.getCustomerName()).isEqualTo("Іван");
        assertThat(order.getEmail()).isNull();
        // Telegram handles are stored without the leading '@'.
        assertThat(order.getTelegramUsername()).isEqualTo("ivan_test");
        assertThat(order.getPostalIndex()).isEqualTo("220000");

        // The @Builder-ignored-initializer bug would have left items == null and thrown here.
        assertThat(order.getItems()).hasSize(1);
        OrderItem item = order.getItems().get(0);
        assertThat(item.getProductName()).isEqualTo("Test Tee");
        assertThat(item.getSizeCode()).isEqualTo("M");
        assertThat(item.getQuantity()).isEqualTo(2);
        assertThat(item.getUnitPrice()).isEqualByComparingTo("49.99");

        assertThat(order.getSubtotalAmount()).isEqualByComparingTo("99.98");
        assertThat(order.getTotalAmount()).isEqualByComparingTo("99.98");
    }
}
