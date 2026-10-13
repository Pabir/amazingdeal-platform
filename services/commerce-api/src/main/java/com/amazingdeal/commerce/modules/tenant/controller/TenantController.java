package com.amazingdeal.commerce.modules.tenant.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.modules.tenant.dto.TenantDto;
import com.amazingdeal.commerce.modules.tenant.dto.UpdateTenantRequest;
import com.amazingdeal.commerce.modules.tenant.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    // Public Storefront Endpoints
    @GetMapping("/storefront/tenant")
    public ResponseEntity<ApiResponse<TenantDto>> getStorefrontTenant() {
        TenantDto tenant = tenantService.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.ok(tenant));
    }

    @GetMapping("/storefront/tenant/{slug}")
    public ResponseEntity<ApiResponse<TenantDto>> getStorefrontTenantBySlug(@PathVariable String slug) {
        TenantDto tenant = tenantService.getTenantBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(tenant));
    }

    // Secured Merchant Admin Endpoints
    @GetMapping("/admin/tenant")
    public ResponseEntity<ApiResponse<TenantDto>> getAdminTenant() {
        TenantDto tenant = tenantService.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.ok(tenant));
    }

    @PutMapping("/admin/tenant")
    public ResponseEntity<ApiResponse<TenantDto>> updateAdminTenant(@Valid @RequestBody UpdateTenantRequest request) {
        TenantDto updated = tenantService.updateCurrentTenant(request);
        return ResponseEntity.ok(ApiResponse.ok("Store settings updated successfully", updated));
    }
}
