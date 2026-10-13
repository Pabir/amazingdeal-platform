package com.amazingdeal.commerce.modules.tenant.dto;

import com.amazingdeal.commerce.modules.tenant.entity.Tenant;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TenantDto(
    UUID id,
    String slug,
    String businessName,
    String customDomain,
    boolean active,
    BrandingDto branding,
    SettingsDto settings,
    Instant createdAt,
    Instant updatedAt
) {
    public record BrandingDto(
        String storeName,
        String logoUrl,
        String faviconUrl,
        String primaryColor,
        String accentColor,
        String currency,
        String currencySymbol,
        String contactEmail,
        String contactPhone,
        String address,
        String bannerHeadline,
        String bannerSubheadline
    ) {}

    public record SettingsDto(
        boolean allowGuestCheckout,
        boolean enableCod,
        boolean enableOnlinePayment,
        BigDecimal minOrderAmount,
        BigDecimal taxRatePercent,
        BigDecimal shippingFee,
        BigDecimal freeShippingThreshold
    ) {}

    public static TenantDto from(Tenant t) {
        return new TenantDto(
            t.getId(),
            t.getSlug(),
            t.getBusinessName(),
            t.getCustomDomain(),
            t.isActive(),
            new BrandingDto(
                t.getStoreName(),
                t.getLogoUrl(),
                t.getFaviconUrl(),
                t.getPrimaryColor(),
                t.getAccentColor(),
                t.getCurrency(),
                t.getCurrencySymbol(),
                t.getContactEmail(),
                t.getContactPhone(),
                t.getAddress(),
                t.getBannerHeadline(),
                t.getBannerSubheadline()
            ),
            new SettingsDto(
                t.isAllowGuestCheckout(),
                t.isEnableCod(),
                t.isEnableOnlinePayment(),
                t.getMinOrderAmount(),
                t.getTaxRatePercent(),
                t.getShippingFee(),
                t.getFreeShippingThreshold()
            ),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }
}
