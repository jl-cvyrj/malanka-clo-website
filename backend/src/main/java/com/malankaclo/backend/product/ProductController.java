package com.malankaclo.backend.product;

import com.malankaclo.backend.common.web.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private static final int MAX_PAGE_SIZE = 48;

    private final ProductService productService;

    @GetMapping
    public PageResponse<ProductSummaryResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        ProductSort productSort = ProductSort.from(sort);
        Pageable pageable = PageRequest.of(Math.max(0, page), clampPageSize(size), productSort.toSort());
        return productService.findActiveSummaries(category, productSort, pageable);
    }

    @GetMapping("/{slug}")
    public ProductDetailResponse detail(@PathVariable String slug) {
        return productService.findActiveDetail(slug);
    }

    private int clampPageSize(int size) {
        return Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    }
}
