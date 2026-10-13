package com.amazingdeal.commerce.modules.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddToCartRequest(
    @NotNull(message = "Product ID is required")
    UUID productId,

    UUID variantId,

    @Min(value = 1, message = "Quantity must be at least 1")
    int quantity,

    String sessionId
) {}
