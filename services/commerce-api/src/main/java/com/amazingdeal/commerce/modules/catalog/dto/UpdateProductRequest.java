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
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.amazingdeal.commerce.core.common.FlexibleStringArrayDeserializer.class)
    String images,
    UUID categoryId,
    Boolean featured,
    Boolean active,
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.amazingdeal.commerce.core.common.FlexibleStringArrayDeserializer.class)
    String tags,
    List<CreateProductRequest.CreateVariantRequest> variants
) {}
