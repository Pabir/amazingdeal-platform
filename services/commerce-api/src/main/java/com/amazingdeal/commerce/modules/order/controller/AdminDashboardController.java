package com.amazingdeal.commerce.modules.order.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.modules.catalog.repository.ProductRepository;
import com.amazingdeal.commerce.modules.order.dto.OrderDto;
import com.amazingdeal.commerce.modules.order.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public AdminDashboardController(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public record DashboardStats(
        BigDecimal totalRevenue,
        long totalOrders,
        long pendingOrders,
        long totalProducts,
        long lowStockProducts,
        List<OrderDto> recentOrders
    ) {}

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING");
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countByStockQuantityLessThan(5);

        List<OrderDto> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc()
            .stream()
            .map(OrderDto::from)
            .toList();

        DashboardStats stats = new DashboardStats(
            totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
            totalOrders,
            pendingOrders,
            totalProducts,
            lowStockProducts,
            recentOrders
        );

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
