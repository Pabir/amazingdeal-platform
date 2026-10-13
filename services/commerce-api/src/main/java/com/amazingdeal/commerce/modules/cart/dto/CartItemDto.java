package com.amazingdeal.commerce.modules.cart.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemDto(
    UUID id,
    UUID productId,
    String productTitle,
    String productSlug,
    String productImage,
    UUID variantId,
    String variantTitle,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal lineTotal,
    int availableStock
) {}
