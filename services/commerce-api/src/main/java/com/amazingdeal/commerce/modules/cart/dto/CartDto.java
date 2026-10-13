package com.amazingdeal.commerce.modules.cart.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartDto(
    UUID id,
    UUID tenantId,
    String sessionId,
    UUID userId,
    List<CartItemDto> items,
    BigDecimal subtotal,
    BigDecimal taxAmount,
    BigDecimal shippingFee,
    BigDecimal total,
    int itemCount
) {}
