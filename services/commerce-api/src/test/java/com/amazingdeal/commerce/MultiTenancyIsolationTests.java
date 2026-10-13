package com.amazingdeal.commerce;

import com.amazingdeal.commerce.core.multitenancy.TenantContext;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.modules.catalog.dto.CategoryDto;
import com.amazingdeal.commerce.modules.catalog.dto.CreateCategoryRequest;
import com.amazingdeal.commerce.modules.catalog.dto.CreateProductRequest;
import com.amazingdeal.commerce.modules.catalog.dto.ProductDto;
import com.amazingdeal.commerce.modules.catalog.service.CatalogService;
import com.amazingdeal.commerce.modules.order.dto.CreateOrderRequest;
import com.amazingdeal.commerce.modules.order.dto.OrderDto;
import com.amazingdeal.commerce.modules.order.service.OrderService;
import com.amazingdeal.commerce.modules.tenant.dto.CreateTenantRequest;
import com.amazingdeal.commerce.modules.tenant.dto.TenantDto;
import com.amazingdeal.commerce.modules.tenant.service.TenantService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@SpringBootTest
public class MultiTenancyIsolationTests {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private CatalogService catalogService;

    @Autowired
    private OrderService orderService;

    @Test
    void testTenantDataIsolationBetweenTwoTenants() {
        String slug1 = "store-alpha-" + UUID.randomUUID().toString().substring(0, 8);
        String slug2 = "store-beta-" + UUID.randomUUID().toString().substring(0, 8);

        TenantDto tenantAlpha = tenantService.createTenant(new CreateTenantRequest(
            slug1, "Store Alpha", "admin@" + slug1 + ".com", "pass1234", "Alpha Admin",
            "Store Alpha", null, null, "#111111", "#222222", "USD", "$", null, null, null, null, null, null
        ));

        TenantDto tenantBeta = tenantService.createTenant(new CreateTenantRequest(
            slug2, "Store Beta", "admin@" + slug2 + ".com", "pass1234", "Beta Admin",
            "Store Beta", null, null, "#333333", "#444444", "USD", "$", null, null, null, null, null, null
        ));

        // 1. Create a product in Tenant Alpha
        ProductDto alphaProduct;
        TenantContextHolder.setContext(new TenantContext(tenantAlpha.id(), tenantAlpha.slug(), null));
        try {
            CategoryDto cat = catalogService.createCategory(new CreateCategoryRequest(
                "Alpha Gear", "alpha-gear", "Desc", null, null, 1
            ));

            alphaProduct = catalogService.createProduct(new CreateProductRequest(
                "Alpha Special Shoes", "alpha-shoes-" + UUID.randomUUID().toString().substring(0, 5),
                "Desc", "Short", BigDecimal.valueOf(100.00), null, null,
                "SKU-ALPHA-" + UUID.randomUUID().toString().substring(0, 5),
                20, null, cat.id(), true, true, null, null
            ));
            Assertions.assertNotNull(alphaProduct.id());
            Assertions.assertEquals(tenantAlpha.id(), alphaProduct.tenantId());
        } finally {
            TenantContextHolder.clear();
        }

        // 2. Query products in Tenant Beta -> Must NOT see Alpha's product!
        TenantContextHolder.setContext(new TenantContext(tenantBeta.id(), tenantBeta.slug(), null));
        try {
            Page<ProductDto> betaProducts = catalogService.getStorefrontProducts(null, null, null, PageRequest.of(0, 50));
            boolean containsAlpha = betaProducts.getContent().stream()
                .anyMatch(p -> p.id().equals(alphaProduct.id()));
            Assertions.assertFalse(containsAlpha, "Tenant Beta should not have access to Tenant Alpha's product!");
        } finally {
            TenantContextHolder.clear();
        }

        // 3. Test Order Placement & Stock Decrement in Tenant Alpha
        TenantContextHolder.setContext(new TenantContext(tenantAlpha.id(), tenantAlpha.slug(), null));
        try {
            OrderDto order = orderService.createOrder(new CreateOrderRequest(
                null,
                "John Doe",
                "john@example.com",
                "+1 555 1234",
                "{\"street\":\"123 Main St\",\"city\":\"New York\",\"postalCode\":\"10001\"}",
                "COD",
                "Leave at doorstep",
                List.of(new CreateOrderRequest.DirectOrderItem(alphaProduct.id(), null, 2))
            ));

            Assertions.assertNotNull(order.id());
            Assertions.assertEquals(tenantAlpha.id(), order.tenantId());
            Assertions.assertEquals("PENDING", order.status());

            // Product stock should have decremented from 20 to 18
            ProductDto refreshedProduct = catalogService.getProductById(alphaProduct.id());
            Assertions.assertEquals(18, refreshedProduct.stockQuantity(), "Stock should decrement by 2 upon order placement");
        } finally {
            TenantContextHolder.clear();
        }
    }
}
