package com.malankaclo.backend.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findAllByActiveTrueOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findAllByActiveTrueAndCategorySlugOrderByCreatedAtDesc(String categorySlug);

    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Product> findByActiveTrueAndCategorySlug(String categorySlug, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<Product> findAllBy(Pageable pageable);

    // Only `category` (a to-one association) is fetched eagerly; the `images` and `sizes`
    // collections are loaded lazily with @BatchSize inside the service transaction. Fetching
    // both collections in one entity graph would trigger MultipleBagFetchException.
    @EntityGraph(attributePaths = {"category"})
    Optional<Product> findBySlugAndActiveTrue(String slug);

    @EntityGraph(attributePaths = {"category"})
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findDetailById(@Param("id") Long id);

    Optional<Product> findByIdAndActiveTrue(Long id);

    boolean existsBySlugIgnoreCase(String slug);
}
