package com.malankaclo.backend.product;

import com.malankaclo.backend.AbstractIntegrationTest;
import com.malankaclo.backend.category.Category;
import com.malankaclo.backend.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductApiIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        category = categoryRepository.save(new Category("Катэгорыя " + suffix, "cat-" + suffix, 5));

        product = new Product(category, "Футболка " + suffix, "tee-" + suffix, "Апісанне",
                new BigDecimal("49.99"), "BYN");
        product.addImage(new ProductImage("https://example.com/a.jpg", "фота 1", 0));
        product.addImage(new ProductImage("https://example.com/b.jpg", "фота 2", 1));
        product.addSize(new ProductSize("S", true));
        product.addSize(new ProductSize("M", false));
        product = productRepository.save(product);
    }

    @Test
    void exposesSeededCategories() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void listsActiveProductsWithPagination() throws Exception {
        mockMvc.perform(get("/api/products").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.content[?(@.slug == '" + product.getSlug() + "')]").isNotEmpty());
    }

    @Test
    void filtersProductsByCategorySlug() throws Exception {
        mockMvc.perform(get("/api/products").param("category", category.getSlug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].slug").value(product.getSlug()))
                .andExpect(jsonPath("$.content[0].categorySlug").value(category.getSlug()))
                .andExpect(jsonPath("$.content[0].primaryImageUrl").value("https://example.com/a.jpg"))
                .andExpect(jsonPath("$.content[0].availableSizes", hasSize(1)))
                .andExpect(jsonPath("$.content[0].availableSizes[0]").value("S"));
    }

    @Test
    void excludesInactiveProductsFromCatalog() throws Exception {
        Product inactive = new Product(category, "Спячы", "inactive-" + UUID.randomUUID(), "desc",
                new BigDecimal("10.00"), "BYN");
        inactive.setActive(false);
        productRepository.save(inactive);

        mockMvc.perform(get("/api/products").param("category", category.getSlug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].slug").value(product.getSlug()));
    }

    @Test
    void returnsProductDetailWithImagesAndSizes() throws Exception {
        mockMvc.perform(get("/api/products/{slug}", product.getSlug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(product.getSlug()))
                .andExpect(jsonPath("$.price").value(49.99))
                .andExpect(jsonPath("$.images", hasSize(2)))
                .andExpect(jsonPath("$.images[0].url").value("https://example.com/a.jpg"))
                .andExpect(jsonPath("$.sizes", hasSize(2)));
    }

    @Test
    void returns404ForUnknownProduct() throws Exception {
        mockMvc.perform(get("/api/products/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message", containsString("Product not found")));
    }

    @Test
    void rejectsUnsupportedSortOption() throws Exception {
        mockMvc.perform(get("/api/products").param("sort", "cheapest"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
