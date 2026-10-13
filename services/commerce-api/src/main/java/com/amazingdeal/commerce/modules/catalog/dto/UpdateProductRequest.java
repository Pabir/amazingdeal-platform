package com.amazingdeal.commerce.modules.catalog.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpdateProductRequest(
    String title,
    String slug,
    String description,
    String shortDescription,
    BigDecimal price,
    BigDecimal compareAtPrice,
    BigDecimal costPrice,
    String sku,
    Integer stockQuantity,
    String images,
    UUID categoryId,
    Boolean featured,
    Boolean active,
    String tags,
    List<CreateProductRequest.CreateVariantRequest> variants
) {}
