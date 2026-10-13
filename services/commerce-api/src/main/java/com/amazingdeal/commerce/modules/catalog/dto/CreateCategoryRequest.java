package com.amazingdeal.commerce.modules.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record CreateCategoryRequest(
    @NotBlank(message = "Category name is required")
    String name,

    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    String slug,

    String description,
    String imageUrl,
    UUID parentId,
    Integer displayOrder
) {}
