package com.malankaclo.backend.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByActiveTrueOrderBySortOrderAsc();

    Optional<Category> findBySlugAndActiveTrue(String slug);

    boolean existsBySlugIgnoreCase(String slug);
}
