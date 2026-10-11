package com.malankaclo.backend.product;

import com.malankaclo.backend.common.exception.BusinessException;
import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductSizeService {

    private final ProductRepository productRepository;

    @Transactional
    public Product addSize(Long productId, String sizeCode, boolean available) {
        if (!SizeCode.isValid(sizeCode)) {
            throw new BusinessException(
                    "Unknown size '" + sizeCode + "'. Allowed sizes: " + SizeCode.ALLOWED);
        }
        String normalized = SizeCode.normalize(sizeCode);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        boolean exists = product.getSizes().stream()
                .anyMatch(size -> size.getSizeCode().equalsIgnoreCase(normalized));
        if (exists) {
            throw new BusinessException("Size already exists for product: " + normalized);
        }

        product.addSize(new ProductSize(normalized, available));
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
