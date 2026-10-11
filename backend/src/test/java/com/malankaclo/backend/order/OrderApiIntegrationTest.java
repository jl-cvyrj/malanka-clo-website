package com.malankaclo.backend.order;

import com.malankaclo.backend.AbstractIntegrationTest;
import com.malankaclo.backend.category.Category;
import com.malankaclo.backend.category.CategoryRepository;
import com.malankaclo.backend.product.Product;
import com.malankaclo.backend.product.ProductRepository;
import com.malankaclo.backend.product.ProductSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderApiIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    private Product product;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Category category = categoryRepository.save(new Category("Катэгорыя " + suffix, "cat-" + suffix, 5));
        product = new Product(category, "Худзі " + suffix, "hoodie-" + suffix, "desc",
                new BigDecimal("80.00"), "BYN");
        product.addSize(new ProductSize("L", true));
        product.addSize(new ProductSize("XL", false));
        product = productRepository.save(product);
    }

    @Test
    void createsOrderUsingServerSidePrice() throws Exception {
        String json = """
                {
                  "type": "DOMESTIC",
                  "customerName": "  Іван  ",
                  "phone": "+375291234567",
                  "country": "Беларусь",
                  "city": "Мінск",
                  "address": "вул. Леніна 1",
                  "deliveryMethod": "BELPOST",
                  "paymentMethod": "FULL_PREPAYMENT",
                  "items": [ { "productId": %d, "sizeCode": "l", "quantity": 3 } ]
                }
                """.formatted(product.getId());

        mockMvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber", startsWith("MLK-")))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
                .andExpect(jsonPath("$.customerName").value("Іван"))
                .andExpect(jsonPath("$.items[0].productName", startsWith("Худзі")))
                .andExpect(jsonPath("$.items[0].sizeCode").value("L"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(80.00))
                .andExpect(jsonPath("$.items[0].lineTotal").value(240.00))
                .andExpect(jsonPath("$.totalAmount").value(240.00));
    }

    @Test
    void rejectsOrderWithoutItems() throws Exception {
        String json = """
                {
                  "type": "DOMESTIC",
                  "customerName": "Іван",
                  "phone": "+375291234567",
                  "city": "Мінск",
                  "address": "вул. Леніна 1",
                  "deliveryMethod": "BELPOST",
                  "paymentMethod": "FULL_PREPAYMENT",
                  "items": []
                }
                """;

        mockMvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.items").exists());
    }

    @Test
    void rejectsUnavailableSize() throws Exception {
        String json = """
                {
                  "type": "DOMESTIC",
                  "customerName": "Іван",
                  "phone": "+375291234567",
                  "city": "Мінск",
                  "address": "вул. Леніна 1",
                  "deliveryMethod": "BELPOST",
                  "paymentMethod": "FULL_PREPAYMENT",
                  "items": [ { "productId": %d, "sizeCode": "XL", "quantity": 1 } ]
                }
                """.formatted(product.getId());

        mockMvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("unavailable")));
    }

    @Test
    void returns404ForUnknownProduct() throws Exception {
        String json = """
                {
                  "type": "DOMESTIC",
                  "customerName": "Іван",
                  "phone": "+375291234567",
                  "city": "Мінск",
                  "address": "вул. Леніна 1",
                  "deliveryMethod": "BELPOST",
                  "paymentMethod": "FULL_PREPAYMENT",
                  "items": [ { "productId": 999999999, "sizeCode": "L", "quantity": 1 } ]
                }
                """;

        mockMvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isNotFound());
    }
}
