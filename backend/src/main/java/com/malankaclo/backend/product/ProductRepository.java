package com.malankaclo.backend.product;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findAllByActiveTrueOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findAllByActiveTrueAndCategorySlugOrderByCreatedAtDesc(String categorySlug);

    @EntityGraph(attributePaths = {"images", "sizes", "category"})
    Optional<Product> findBySlugAndActiveTrue(String slug);

    Optional<Product> findByIdAndActiveTrue(Long id);

    boolean existsBySlugIgnoreCase(String slug);
}
