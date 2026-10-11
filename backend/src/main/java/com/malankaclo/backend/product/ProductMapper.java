package com.malankaclo.backend.product;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {

    public ProductSummaryResponse toSummary(Product product) {
        List<ProductImage> images = product.getImages();
        String primaryImageUrl = images.isEmpty() ? null : images.get(0).getUrl();

        List<String> availableSizes = product.getSizes().stream()
                .filter(ProductSize::isAvailable)
                .map(ProductSize::getSizeCode)
                .toList();

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getPrice(),
                product.getCurrency(),
                product.getCategory().getName(),
                product.getCategory().getSlug(),
                primaryImageUrl,
                availableSizes,
                product.isActive()
        );
    }

    public ProductDetailResponse toDetail(Product product) {
        List<ProductImageResponse> images = product.getImages().stream()
                .map(this::toImage)
                .toList();
        List<ProductSizeResponse> sizes = product.getSizes().stream()
                .map(this::toSize)
                .toList();

        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getCurrency(),
                product.getCategory().getName(),
                product.getCategory().getSlug(),
                product.isActive(),
                images,
                sizes
        );
    }

    public ProductImageResponse toImage(ProductImage image) {
        return new ProductImageResponse(image.getId(), image.getUrl(), image.getAltText(), image.getSortOrder());
    }

    public ProductSizeResponse toSize(ProductSize size) {
        return new ProductSizeResponse(size.getId(), size.getSizeCode(), size.isAvailable());
    }
}
