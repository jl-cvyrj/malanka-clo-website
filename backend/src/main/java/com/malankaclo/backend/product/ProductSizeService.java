package com.malankaclo.backend.product;

import com.malankaclo.backend.common.exception.BusinessException;
import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductSizeService {

    private final ProductRepository productRepository;

    public ProductSizeService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public Product addSize(Long productId, String sizeCode, boolean available) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        boolean exists = product.getSizes().stream()
                .anyMatch(size -> size.getSizeCode().equalsIgnoreCase(sizeCode));
        if (exists) {
            throw new BusinessException("Size already exists for product: " + sizeCode);
        }

        product.addSize(new ProductSize(sizeCode, available));
        return product;
    }

    @Transactional
    public void setAvailability(Long productId, Long sizeId, boolean available) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        ProductSize size = product.getSizes().stream()
                .filter(item -> item.getId().equals(sizeId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Size not found: " + sizeId));

        size.setAvailable(available);
    }
}
