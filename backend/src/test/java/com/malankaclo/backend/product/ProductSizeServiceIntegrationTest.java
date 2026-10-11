package com.malankaclo.backend.product;

import com.malankaclo.backend.AbstractIntegrationTest;
import com.malankaclo.backend.category.Category;
import com.malankaclo.backend.category.CategoryRepository;
import com.malankaclo.backend.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ProductSizeServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ProductSizeService productSizeService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Product newProduct() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Category category = categoryRepository.save(
                new Category("Size category " + suffix, "size-cat-" + suffix, 7));
        return productRepository.save(new Product(
                category, "Size tee " + suffix, "size-tee-" + suffix, null,
                new BigDecimal("10.00"), "BYN"));
    }

    @Test
    void addsAndNormalizesKnownSize() {
        Product product = newProduct();

        Product updated = productSizeService.addSize(product.getId(), "m", true);

        assertThat(updated.getSizes()).hasSize(1);
        assertThat(updated.getSizes().get(0).getSizeCode()).isEqualTo("M");
    }

    @Test
    void rejectsUnknownSize() {
        Product product = newProduct();

        assertThatThrownBy(() -> productSizeService.addSize(product.getId(), "XXXL", true))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Unknown size");
    }
}
