package com.amazingdeal.commerce.modules.order.service;

import com.amazingdeal.commerce.core.common.BadRequestException;
import com.amazingdeal.commerce.core.common.ResourceNotFoundException;
import com.amazingdeal.commerce.core.events.DomainEventPublisher;
import com.amazingdeal.commerce.core.events.OrderPlacedEvent;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.modules.cart.entity.Cart;
import com.amazingdeal.commerce.modules.cart.entity.CartItem;
import com.amazingdeal.commerce.modules.cart.repository.CartItemRepository;
import com.amazingdeal.commerce.modules.cart.repository.CartRepository;
import com.amazingdeal.commerce.modules.catalog.entity.Product;
import com.amazingdeal.commerce.modules.catalog.entity.ProductVariant;
import com.amazingdeal.commerce.modules.catalog.repository.ProductRepository;
import com.amazingdeal.commerce.modules.catalog.repository.ProductVariantRepository;
import com.amazingdeal.commerce.modules.order.dto.CreateOrderRequest;
import com.amazingdeal.commerce.modules.order.dto.OrderDto;
import com.amazingdeal.commerce.modules.order.dto.UpdateOrderStatusRequest;
import com.amazingdeal.commerce.modules.order.entity.Order;
import com.amazingdeal.commerce.modules.order.entity.OrderItem;
import com.amazingdeal.commerce.modules.order.repository.OrderRepository;
import com.amazingdeal.commerce.modules.tenant.entity.Tenant;
import com.amazingdeal.commerce.modules.tenant.repository.TenantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final TenantRepository tenantRepository;
    private final DomainEventPublisher domainEventPublisher;

    private final SecureRandom random = new SecureRandom();

    public OrderService(
        OrderRepository orderRepository,
        CartRepository cartRepository,
        CartItemRepository cartItemRepository,
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository,
        TenantRepository tenantRepository,
        DomainEventPublisher domainEventPublisher
    ) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.tenantRepository = tenantRepository;
        this.domainEventPublisher = domainEventPublisher;
    }

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        UUID tenantId = TenantContextHolder.requireTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant store not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderPlacedEvent.OrderItemDetail> eventItemDetails = new ArrayList<>();

        if (request.cartId() != null) {
            Cart cart = cartRepository.findById(request.cartId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found: " + request.cartId()));
            List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
            if (cartItems.isEmpty()) {
                throw new BadRequestException("Cannot create order from an empty cart");
            }

            for (CartItem ci : cartItems) {
                Product product = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + ci.getProductId()));

                ProductVariant variant = ci.getVariantId() != null
                    ? productVariantRepository.findById(ci.getVariantId()).orElse(null)
                    : null;

                BigDecimal unitPrice = variant != null ? variant.getPrice() : product.getPrice();
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
                subtotal = subtotal.add(lineTotal);

                OrderItem oi = new OrderItem();
                oi.setProductId(product.getId());
                oi.setProductTitle(product.getTitle());
                oi.setProductSku(variant != null ? variant.getSku() : product.getSku());
                oi.setProductImage(getFirstImage(product.getImages()));
                oi.setVariantId(variant != null ? variant.getId() : null);
                oi.setVariantTitle(variant != null ? variant.getTitle() : null);
                oi.setUnitPrice(unitPrice);
                oi.setQuantity(ci.getQuantity());
                oi.setTotalPrice(lineTotal);
                orderItems.add(oi);

                eventItemDetails.add(new OrderPlacedEvent.OrderItemDetail(
                    product.getId(),
                    variant != null ? variant.getId() : null,
                    ci.getQuantity(),
                    product.getTitle()
                ));
            }

            // Clear cart
            cartItemRepository.deleteByCartId(cart.getId());
        } else if (request.directItems() != null && !request.directItems().isEmpty()) {
            for (CreateOrderRequest.DirectOrderItem di : request.directItems()) {
                Product product = productRepository.findById(di.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + di.productId()));

                ProductVariant variant = di.variantId() != null
                    ? productVariantRepository.findById(di.variantId()).orElse(null)
                    : null;

                BigDecimal unitPrice = variant != null ? variant.getPrice() : product.getPrice();
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(di.quantity()));
                subtotal = subtotal.add(lineTotal);

                OrderItem oi = new OrderItem();
                oi.setProductId(product.getId());
                oi.setProductTitle(product.getTitle());
                oi.setProductSku(variant != null ? variant.getSku() : product.getSku());
                oi.setProductImage(getFirstImage(product.getImages()));
                oi.setVariantId(variant != null ? variant.getId() : null);
                oi.setVariantTitle(variant != null ? variant.getTitle() : null);
                oi.setUnitPrice(unitPrice);
                oi.setQuantity(di.quantity());
                oi.setTotalPrice(lineTotal);
                orderItems.add(oi);

                eventItemDetails.add(new OrderPlacedEvent.OrderItemDetail(
                    product.getId(),
                    variant != null ? variant.getId() : null,
                    di.quantity(),
                    product.getTitle()
                ));
            }
        } else {
            throw new BadRequestException("Order must contain cart items or direct items");
        }

        // Calculate tax and shipping
        BigDecimal taxRate = tenant.getTaxRatePercent() != null ? tenant.getTaxRatePercent() : BigDecimal.ZERO;
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal shippingFee = BigDecimal.ZERO;
        if (tenant.getShippingFee() != null && subtotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal freeThreshold = tenant.getFreeShippingThreshold();
            if (freeThreshold == null || subtotal.compareTo(freeThreshold) < 0) {
                shippingFee = tenant.getShippingFee();
            }
        }

        BigDecimal totalAmount = subtotal.add(taxAmount).add(shippingFee);

        // Generate unique order number
        String orderNumber = "ORD-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + random.nextInt(9000));

        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setOrderNumber(orderNumber);
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setCustomerPhone(request.customerPhone());
        order.setStatus("PENDING");
        order.setPaymentStatus("PENDING");
        order.setPaymentMethod(request.paymentMethod() != null ? request.paymentMethod() : "COD");
        order.setShippingAddress(request.shippingAddress());
        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setShippingFee(shippingFee);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(totalAmount);
        order.setNotes(request.notes());
        order.setTimeline("[{\"timestamp\":\"" + Instant.now() + "\",\"status\":\"PENDING\",\"note\":\"Order placed successfully\"}]");

        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Decoupled domain event: triggers stock decrement and notifications
        domainEventPublisher.publish(new OrderPlacedEvent(
            order.getId(),
            tenantId,
            order.getOrderNumber(),
            order.getCustomerName(),
            order.getCustomerPhone(),
            order.getCustomerEmail(),
            order.getTotalAmount(),
            eventItemDetails
        ));

        return OrderDto.from(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
        return OrderDto.from(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        return OrderDto.from(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getCustomerOrders(String customerEmail, Pageable pageable) {
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(customerEmail, pageable)
            .map(OrderDto::from);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAdminOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map(OrderDto::from);
    }

    @Transactional
    public OrderDto updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setStatus(request.status().toUpperCase());
        if (request.paymentStatus() != null) {
            order.setPaymentStatus(request.paymentStatus().toUpperCase());
        }

        String note = request.note() != null ? request.note() : "Status changed to " + request.status();
        String currentTimeline = order.getTimeline() != null ? order.getTimeline() : "[]";
        String eventJson = "{\"timestamp\":\"" + Instant.now() + "\",\"status\":\"" + request.status() + "\",\"note\":\"" + note + "\"}";

        if (currentTimeline.endsWith("]")) {
            if (currentTimeline.length() > 2) {
                order.setTimeline(currentTimeline.substring(0, currentTimeline.length() - 1) + "," + eventJson + "]");
            } else {
                order.setTimeline("[" + eventJson + "]");
            }
        } else {
            order.setTimeline("[" + eventJson + "]");
        }

        order = orderRepository.save(order);
        return OrderDto.from(order);
    }

    private String getFirstImage(String imagesJson) {
        if (imagesJson == null) return null;
        String clean = imagesJson.replaceAll("[\\[\\]\"']", "");
        String[] parts = clean.split(",");
        return parts.length > 0 && !parts[0].isBlank() ? parts[0].trim() : null;
    }
}
