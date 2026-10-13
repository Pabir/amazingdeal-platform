package com.amazingdeal.commerce.modules.tenant.service;

import com.amazingdeal.commerce.core.common.BadRequestException;
import com.amazingdeal.commerce.core.common.TenantNotFoundException;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.core.multitenancy.TenantResolver;
import com.amazingdeal.commerce.modules.tenant.dto.CreateTenantRequest;
import com.amazingdeal.commerce.modules.tenant.dto.TenantDto;
import com.amazingdeal.commerce.modules.tenant.dto.UpdateTenantRequest;
import com.amazingdeal.commerce.modules.tenant.entity.Tenant;
import com.amazingdeal.commerce.modules.tenant.entity.User;
import com.amazingdeal.commerce.modules.tenant.repository.TenantRepository;
import com.amazingdeal.commerce.modules.tenant.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantResolver tenantResolver;

    public TenantService(
        TenantRepository tenantRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        TenantResolver tenantResolver
    ) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantResolver = tenantResolver;
    }

    @Transactional
    public TenantDto createTenant(CreateTenantRequest request) {
        String slug = request.slug().toLowerCase().trim();
        if (tenantRepository.existsBySlug(slug)) {
            throw new BadRequestException("Tenant slug '" + slug + "' is already taken");
        }

        Tenant tenant = new Tenant();
        tenant.setSlug(slug);
        tenant.setBusinessName(request.businessName());
        tenant.setStoreName(request.storeName() != null ? request.storeName() : request.businessName());
        tenant.setCustomDomain(request.customDomain());
        tenant.setContactEmail(request.merchantEmail());
        tenant.setContactPhone(request.contactPhone());
        tenant.setAddress(request.address());
        tenant.setBannerHeadline(request.bannerHeadline() != null ? request.bannerHeadline() : "Welcome to " + tenant.getStoreName());
        tenant.setBannerSubheadline(request.bannerSubheadline() != null ? request.bannerSubheadline() : "Browse our premium selection of products");

        if (request.logoUrl() != null) tenant.setLogoUrl(request.logoUrl());
        if (request.primaryColor() != null) tenant.setPrimaryColor(request.primaryColor());
        if (request.accentColor() != null) tenant.setAccentColor(request.accentColor());
        if (request.currency() != null) tenant.setCurrency(request.currency());
        if (request.currencySymbol() != null) tenant.setCurrencySymbol(request.currencySymbol());
        if (request.shippingFee() != null) tenant.setShippingFee(request.shippingFee());
        if (request.freeShippingThreshold() != null) tenant.setFreeShippingThreshold(request.freeShippingThreshold());

        tenant = tenantRepository.save(tenant);

        // Create initial merchant admin user
        User admin = new User();
        admin.setTenantId(tenant.getId());
        admin.setEmail(request.merchantEmail().toLowerCase().trim());
        admin.setPasswordHash(passwordEncoder.encode(request.merchantPassword()));
        admin.setFullName(request.merchantFullName());
        admin.setRole("MERCHANT_ADMIN");
        admin.setPhone(request.contactPhone());
        userRepository.save(admin);

        return TenantDto.from(tenant);
    }

    @Transactional(readOnly = true)
    public TenantDto getTenantBySlug(String slug) {
        Tenant tenant = tenantRepository.findBySlug(slug.toLowerCase().trim())
            .filter(Tenant::isActive)
            .orElseThrow(() -> new TenantNotFoundException("Tenant not found for slug: " + slug));
        return TenantDto.from(tenant);
    }

    @Transactional(readOnly = true)
    public TenantDto getTenantById(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .filter(Tenant::isActive)
            .orElseThrow(() -> new TenantNotFoundException("Tenant not found for id: " + tenantId));
        return TenantDto.from(tenant);
    }

    @Transactional(readOnly = true)
    public TenantDto getCurrentTenant() {
        UUID tenantId = TenantContextHolder.requireTenantId();
        return getTenantById(tenantId);
    }

    @Transactional
    public TenantDto updateCurrentTenant(UpdateTenantRequest request) {
        UUID tenantId = TenantContextHolder.requireTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new TenantNotFoundException("Tenant not found"));

        if (request.businessName() != null) tenant.setBusinessName(request.businessName());
        if (request.storeName() != null) tenant.setStoreName(request.storeName());
        if (request.customDomain() != null) tenant.setCustomDomain(request.customDomain());
        if (request.logoUrl() != null) tenant.setLogoUrl(request.logoUrl());
        if (request.faviconUrl() != null) tenant.setFaviconUrl(request.faviconUrl());
        if (request.primaryColor() != null) tenant.setPrimaryColor(request.primaryColor());
        if (request.accentColor() != null) tenant.setAccentColor(request.accentColor());
        if (request.currency() != null) tenant.setCurrency(request.currency());
        if (request.currencySymbol() != null) tenant.setCurrencySymbol(request.currencySymbol());
        if (request.contactEmail() != null) tenant.setContactEmail(request.contactEmail());
        if (request.contactPhone() != null) tenant.setContactPhone(request.contactPhone());
        if (request.address() != null) tenant.setAddress(request.address());
        if (request.bannerHeadline() != null) tenant.setBannerHeadline(request.bannerHeadline());
        if (request.bannerSubheadline() != null) tenant.setBannerSubheadline(request.bannerSubheadline());
        if (request.allowGuestCheckout() != null) tenant.setAllowGuestCheckout(request.allowGuestCheckout());
        if (request.enableCod() != null) tenant.setEnableCod(request.enableCod());
        if (request.enableOnlinePayment() != null) tenant.setEnableOnlinePayment(request.enableOnlinePayment());
        if (request.minOrderAmount() != null) tenant.setMinOrderAmount(request.minOrderAmount());
        if (request.taxRatePercent() != null) tenant.setTaxRatePercent(request.taxRatePercent());
        if (request.shippingFee() != null) tenant.setShippingFee(request.shippingFee());
        if (request.freeShippingThreshold() != null) tenant.setFreeShippingThreshold(request.freeShippingThreshold());

        tenant = tenantRepository.save(tenant);
        tenantResolver.evict(tenant.getId(), tenant.getSlug(), tenant.getCustomDomain());

        return TenantDto.from(tenant);
    }
}
