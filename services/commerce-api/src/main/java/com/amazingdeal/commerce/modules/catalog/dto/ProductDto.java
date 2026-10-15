package com.amazingdeal.commerce.modules.catalog.dto;

import com.amazingdeal.commerce.modules.catalog.entity.Product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductDto(
    UUID id,
    UUID tenantId,
    UUID categoryId,
    String categoryName,
    String title,
    String slug,
    String description,
    String shortDescription,
    BigDecimal price,
    BigDecimal compareAtPrice,
    BigDecimal costPrice,
    String sku,
    int stockQuantity,
    boolean inStock,
    String images,
    boolean featured,
    boolean active,
    String tags,
    List<ProductVariantDto> variants,
    Instant createdAt,
    Instant updatedAt
) {
    public static ProductDto from(Product p) {
        List<ProductVariantDto> variantDtos = p.getVariants() != null
            ? p.getVariants().stream().map(ProductVariantDto::from).toList()
            : List.of();

        String catName = null;
        try {
            if (p.getCategory() != null) {
                catName = p.getCategory().getName();
            }
        } catch (Exception ignored) {}

        return new ProductDto(
            p.getId(),
            p.getTenantId(),
            p.getCategoryId(),
            catName,
            p.getTitle(),
            p.getSlug(),
            p.getDescription(),
            p.getShortDescription(),
            p.getPrice(),
            p.getCompareAtPrice(),
            p.getCostPrice(),
            p.getSku(),
            p.getStockQuantity(),
            p.getStockQuantity() > 0,
            p.getImages(),
            p.isFeatured(),
            p.isActive(),
            p.getTags(),
            variantDtos,
            p.getCreatedAt(),
            p.getUpdatedAt()
        );
    }
}
