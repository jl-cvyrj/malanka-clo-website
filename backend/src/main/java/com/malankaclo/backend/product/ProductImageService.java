package com.malankaclo.backend.product;

import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductRepository productRepository;

    @Transactional
    public Product addImage(Long productId, String url, String altText, Integer sortOrder) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        product.addImage(new ProductImage(url, altText, sortOrder));
        return product;
    }

    @Transactional
    public void removeImage(Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        boolean removed = product.getImages().removeIf(image -> image.getId().equals(imageId));
        if (!removed) {
            throw new ResourceNotFoundException("Image not found: " + imageId);
        }
    }

    @Transactional
    public void reorderImage(Long productId, Long imageId, int newSortOrder) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        ProductImage image = product.getImages().stream()
                .filter(item -> item.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        image.setSortOrder(newSortOrder);
    }
}
