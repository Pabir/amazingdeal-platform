package com.amazingdeal.commerce.modules.catalog.dto;

import com.amazingdeal.commerce.modules.catalog.entity.Category;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public record CategoryDto(
    UUID id,
    UUID tenantId,
    String name,
    String slug,
    String description,
    String imageUrl,
    UUID parentId,
    int displayOrder,
    boolean active,
    Instant createdAt,
    Instant updatedAt
) {
    public static CategoryDto from(Category c) {
        return new CategoryDto(
            c.getId(),
            c.getTenantId(),
            c.getName(),
            c.getSlug(),
            c.getDescription(),
            c.getImageUrl(),
            c.getParentId(),
            c.getDisplayOrder(),
            c.isActive(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }
}
