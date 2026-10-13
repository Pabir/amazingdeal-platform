package com.amazingdeal.commerce.modules.cart.dto;

import jakarta.validation.constraints.Min;

public record UpdateCartItemQuantityRequest(
    @Min(value = 0, message = "Quantity must be greater than or equal to 0")
    int quantity
) {}
