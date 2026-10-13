package com.amazingdeal.commerce.core.events;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderPlacedEvent(
    UUID orderId,
    UUID tenantId,
    String orderNumber,
    String customerName,
    String customerPhone,
    String customerEmail,
    BigDecimal totalAmount,
    List<OrderItemDetail> items
) {
    public record OrderItemDetail(
        UUID productId,
        UUID variantId,
        int quantity,
        String title
    ) {}
}
