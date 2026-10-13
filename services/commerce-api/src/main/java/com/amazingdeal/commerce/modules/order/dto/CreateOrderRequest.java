package com.amazingdeal.commerce.modules.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
    UUID cartId,

    @NotBlank(message = "Customer name is required")
    String customerName,

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    String customerEmail,

    @NotBlank(message = "Customer phone is required")
    String customerPhone,

    @NotBlank(message = "Shipping address is required")
    String shippingAddress,

    String paymentMethod,
    String notes,
    List<DirectOrderItem> directItems
) {
    public record DirectOrderItem(
        UUID productId,
        UUID variantId,
        int quantity
    ) {}
}
