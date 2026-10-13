package com.amazingdeal.commerce.modules.tenant.dto;

import java.math.BigDecimal;

public record UpdateTenantRequest(
    String businessName,
    String storeName,
    String customDomain,
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
    String bannerSubheadline,
    Boolean allowGuestCheckout,
    Boolean enableCod,
    Boolean enableOnlinePayment,
    BigDecimal minOrderAmount,
    BigDecimal taxRatePercent,
    BigDecimal shippingFee,
    BigDecimal freeShippingThreshold
) {}
