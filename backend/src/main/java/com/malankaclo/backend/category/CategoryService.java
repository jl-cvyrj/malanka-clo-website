package com.malankaclo.backend.category;

import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<Category> findAllActive() {
        return categoryRepository.findAllByActiveTrueOrderBySortOrderAsc();
    }

    @Transactional(readOnly = true)
    public Category findActiveBySlug(String slug) {
        return categoryRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + slug));
    }

    @Transactional(readOnly = true)
    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + id));
    }

    @Transactional
    public Category create(String name, String slug, Integer sortOrder) {
        validateSlugIsFree(slug);
        return categoryRepository.save(new Category(name, slug, sortOrder == null ? 0 : sortOrder));
    }

    @Transactional
    public Category update(Long id, String name, String slug, Integer sortOrder) {
        Category category = findById(id);

        if (!category.getSlug().equalsIgnoreCase(slug)
                && categoryRepository.existsBySlugIgnoreCase(slug)) {
            throw new IllegalArgumentException("Category slug already exists: " + slug);
        }

        category.setName(name);
        category.setSlug(slug);
        category.setSortOrder(sortOrder == null ? 0 : sortOrder);

        return categoryRepository.save(category);
    }

    @Transactional
    public void deactivate(Long id) {
        Category category = findById(id);
        category.setActive(false);
    }
    
    @Transactional
    public void activate(Long id) {
        Category category = findById(id);
        category.setActive(true);
    }

    private void validateSlugIsFree(String slug) {
        if (categoryRepository.existsBySlugIgnoreCase(slug)) {
            throw new IllegalArgumentException("Category slug already exists: " + slug);
        }
    }
}
