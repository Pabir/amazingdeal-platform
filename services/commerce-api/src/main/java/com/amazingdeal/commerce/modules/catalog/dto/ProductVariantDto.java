package com.amazingdeal.commerce.modules.catalog.dto;

import com.amazingdeal.commerce.modules.catalog.entity.ProductVariant;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductVariantDto(
    UUID id,
    UUID tenantId,
    UUID productId,
    String sku,
    String title,
    BigDecimal price,
    BigDecimal compareAtPrice,
    int stockQuantity,
    String options,
    Instant createdAt,
    Instant updatedAt
) {
    public static ProductVariantDto from(ProductVariant v) {
        return new ProductVariantDto(
            v.getId(),
            v.getTenantId(),
            v.getProductId(),
            v.getSku(),
            v.getTitle(),
            v.getPrice(),
            v.getCompareAtPrice(),
            v.getStockQuantity(),
            v.getOptions(),
            v.getCreatedAt(),
            v.getUpdatedAt()
        );
    }
}
