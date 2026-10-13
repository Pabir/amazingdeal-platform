package com.amazingdeal.commerce.modules.order.dto;

import com.amazingdeal.commerce.modules.order.entity.Order;
import com.amazingdeal.commerce.modules.order.entity.OrderItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderDto(
    UUID id,
    UUID tenantId,
    String orderNumber,
    String customerName,
    String customerEmail,
    String customerPhone,
    String status,
    String paymentStatus,
    String paymentMethod,
    String shippingAddress,
    BigDecimal subtotal,
    BigDecimal taxAmount,
    BigDecimal shippingFee,
    BigDecimal discountAmount,
    BigDecimal totalAmount,
    String notes,
    String timeline,
    List<OrderItemDto> items,
    Instant createdAt,
    Instant updatedAt
) {
    public record OrderItemDto(
        UUID id,
        UUID orderId,
        UUID productId,
        String productTitle,
        String productSku,
        String productImage,
        UUID variantId,
        String variantTitle,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal totalPrice
    ) {
        public static OrderItemDto from(OrderItem item) {
            return new OrderItemDto(
                item.getId(),
                item.getOrderId(),
                item.getProductId(),
                item.getProductTitle(),
                item.getProductSku(),
                item.getProductImage(),
                item.getVariantId(),
                item.getVariantTitle(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getTotalPrice()
            );
        }
    }

    public static OrderDto from(Order o) {
        List<OrderItemDto> itemDtos = o.getItems() != null
            ? o.getItems().stream().map(OrderItemDto::from).toList()
            : List.of();

        return new OrderDto(
            o.getId(),
            o.getTenantId(),
            o.getOrderNumber(),
            o.getCustomerName(),
            o.getCustomerEmail(),
            o.getCustomerPhone(),
            o.getStatus(),
            o.getPaymentStatus(),
            o.getPaymentMethod(),
            o.getShippingAddress(),
            o.getSubtotal(),
            o.getTaxAmount(),
            o.getShippingFee(),
            o.getDiscountAmount(),
            o.getTotalAmount(),
            o.getNotes(),
            o.getTimeline(),
            itemDtos,
            o.getCreatedAt(),
            o.getUpdatedAt()
        );
    }
}
