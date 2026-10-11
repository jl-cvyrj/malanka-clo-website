package com.malankaclo.backend.category;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @GetMapping
    public List<CategoryResponse> listAll() {
        return categoryService.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        Category category = categoryService.create(request.name(), request.slug(), request.sortOrder());
        return categoryMapper.toResponse(category);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        Category category = categoryService.update(id, request.name(), request.slug(), request.sortOrder());
        return categoryMapper.toResponse(category);
    }

    @PostMapping("/{id}/activate")
    public CategoryResponse activate(@PathVariable Long id) {
        categoryService.activate(id);
        return categoryMapper.toResponse(categoryService.findById(id));
    }

    @PostMapping("/{id}/deactivate")
    public CategoryResponse deactivate(@PathVariable Long id) {
        categoryService.deactivate(id);
        return categoryMapper.toResponse(categoryService.findById(id));
    }
}
