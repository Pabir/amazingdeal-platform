package com.amazingdeal.commerce.modules.order.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.core.common.PageResponse;
import com.amazingdeal.commerce.modules.order.dto.CreateOrderRequest;
import com.amazingdeal.commerce.modules.order.dto.OrderDto;
import com.amazingdeal.commerce.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/storefront/orders")
public class StorefrontOrderController {

    private final OrderService orderService;

    public StorefrontOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByNumber(@PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getCustomerOrders(
        @RequestParam String customerEmail,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDto> orders = orderService.getCustomerOrders(customerEmail, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(orders)));
    }
}
