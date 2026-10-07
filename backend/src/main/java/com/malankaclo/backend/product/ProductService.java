package com.malankaclo.backend.product;

import com.malankaclo.backend.category.Category;
import com.malankaclo.backend.category.CategoryRepository;
import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Product> findAllActive() {
        return productRepository.findAllByActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Product> findAllActiveByCategory(String categorySlug) {
        return productRepository.findAllByActiveTrueAndCategorySlugOrderByCreatedAtDesc(categorySlug);
    }

    @Transactional(readOnly = true)
    public Product findActiveBySlug(String slug) {
        return productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
    }

    @Transactional(readOnly = true)
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Transactional
    public Product create(Long categoryId,
                          String name,
                          String slug,
                          String description,
                          BigDecimal price,
                          String currency) {
        validateSlugIsFree(slug);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        Product product = new Product(
                category,
                name,
                slug,
                description,
                price,
                currency
        );

        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id,
                          Long categoryId,
                          String name,
                          String slug,
                          String description,
                          BigDecimal price,
                          String currency) {
        Product product = findById(id);

        if (!product.getSlug().equalsIgnoreCase(slug)
                && productRepository.existsBySlugIgnoreCase(slug)) {
            throw new IllegalArgumentException("Product slug already exists: " + slug);
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        product.setCategory(category);
        product.setName(name);
        product.setSlug(slug);
        product.setDescription(description);
        product.setPrice(price);
        product.setCurrency(currency);

        return productRepository.save(product);
    }
    
    @Transactional
    public void activate(Long id) {
        Product product = findById(id);
        product.setActive(true);
    }
    
    @Transactional
    public void deactivate(Long id) {
        Product product = findById(id);
        product.setActive(false);
    }

    private void validateSlugIsFree(String slug) {
        if (productRepository.existsBySlugIgnoreCase(slug)) {
            throw new IllegalArgumentException("Product slug already exists: " + slug);
        }
    }
}
