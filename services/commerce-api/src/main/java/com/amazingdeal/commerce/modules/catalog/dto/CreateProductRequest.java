package com.amazingdeal.commerce.modules.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateProductRequest(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    String slug,

    @NotBlank(message = "Description is required")
    String description,

    String shortDescription,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be greater than or equal to 0")
    BigDecimal price,

    BigDecimal compareAtPrice,
    BigDecimal costPrice,

    @NotBlank(message = "SKU is required")
    String sku,

    @Min(value = 0, message = "Stock quantity cannot be negative")
    int stockQuantity,

    String images, // JSON array string e.g. ["url1", "url2"]
    UUID categoryId,
    Boolean featured,
    Boolean active,
    String tags,
    List<CreateVariantRequest> variants
) {
    public record CreateVariantRequest(
        @NotBlank(message = "Variant SKU is required")
        String sku,

        @NotBlank(message = "Variant title is required")
        String title,

        @NotNull(message = "Variant price is required")
        BigDecimal price,

        BigDecimal compareAtPrice,
        int stockQuantity,
        String options
    ) {}
}
