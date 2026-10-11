package com.malankaclo.backend.product;

import com.malankaclo.backend.common.web.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private static final int MAX_PAGE_SIZE = 100;

    private final ProductService productService;
    private final ProductImageService productImageService;
    private final ProductSizeService productSizeService;

    @GetMapping
    public PageResponse<ProductSummaryResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int clamped = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        return productService.findSummariesForAdmin(PageRequest.of(Math.max(0, page), clamped));
    }

    @GetMapping("/{id}")
    public ProductDetailResponse detail(@PathVariable Long id) {
        return productService.findDetailForAdmin(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDetailResponse create(@Valid @RequestBody ProductRequest request) {
        Product product = productService.create(
                request.categoryId(), request.name(), request.slug(),
                request.description(), request.price(), normalizeCurrency(request.currency()));
        return productService.findDetailForAdmin(product.getId());
    }

    @PutMapping("/{id}")
    public ProductDetailResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        productService.update(
                id, request.categoryId(), request.name(), request.slug(),
                request.description(), request.price(), normalizeCurrency(request.currency()));
        return productService.findDetailForAdmin(id);
    }

    @PostMapping("/{id}/activate")
    public ProductDetailResponse activate(@PathVariable Long id) {
        productService.activate(id);
        return productService.findDetailForAdmin(id);
    }

    @PostMapping("/{id}/deactivate")
    public ProductDetailResponse deactivate(@PathVariable Long id) {
        productService.deactivate(id);
        return productService.findDetailForAdmin(id);
    }

    @PostMapping("/{id}/images")
    public ProductDetailResponse addImage(@PathVariable Long id, @Valid @RequestBody ProductImageRequest request) {
        productImageService.addImage(id, request.url(), request.altText(), request.sortOrder());
        return productService.findDetailForAdmin(id);
    }

    @PatchMapping("/{id}/images/{imageId}")
    public ProductDetailResponse reorderImage(@PathVariable Long id, @PathVariable Long imageId,
                                              @Valid @RequestBody ProductImageSortRequest request) {
        productImageService.reorderImage(id, imageId, request.sortOrder());
        return productService.findDetailForAdmin(id);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ProductDetailResponse removeImage(@PathVariable Long id, @PathVariable Long imageId) {
        productImageService.removeImage(id, imageId);
        return productService.findDetailForAdmin(id);
    }

    @PostMapping("/{id}/sizes")
    public ProductDetailResponse addSize(@PathVariable Long id, @Valid @RequestBody ProductSizeRequest request) {
        boolean available = request.available() == null || request.available();
        productSizeService.addSize(id, request.sizeCode(), available);
        return productService.findDetailForAdmin(id);
    }

    @PatchMapping("/{id}/sizes/{sizeId}")
    public ProductDetailResponse updateSize(@PathVariable Long id, @PathVariable Long sizeId,
                                            @Valid @RequestBody ProductSizeUpdateRequest request) {
        productSizeService.setAvailability(id, sizeId, request.available());
        return productService.findDetailForAdmin(id);
    }

    private String normalizeCurrency(String currency) {
        return currency == null || currency.isBlank() ? "BYN" : currency;
    }
}
