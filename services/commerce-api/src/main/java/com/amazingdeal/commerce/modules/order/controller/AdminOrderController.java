package com.amazingdeal.commerce.modules.order.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.core.common.PageResponse;
import com.amazingdeal.commerce.modules.order.dto.OrderDto;
import com.amazingdeal.commerce.modules.order.dto.UpdateOrderStatusRequest;
import com.amazingdeal.commerce.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDto> orders = orderService.getAdminOrders(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(orders)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(@PathVariable UUID id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderDto updated = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated successfully", updated));
    }
}
