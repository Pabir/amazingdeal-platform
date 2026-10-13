package com.amazingdeal.commerce.modules.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateTenantRequest(
    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    @Size(min = 3, max = 50, message = "Slug must be between 3 and 50 characters")
    String slug,

    @NotBlank(message = "Business name is required")
    String businessName,

    @NotBlank(message = "Merchant email is required")
    @Email(message = "Invalid merchant email format")
    String merchantEmail,

    @NotBlank(message = "Merchant password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String merchantPassword,

    @NotBlank(message = "Merchant full name is required")
    String merchantFullName,

    String storeName,
    String customDomain,
    String logoUrl,
    String primaryColor,
    String accentColor,
    String currency,
    String currencySymbol,
    String contactPhone,
    String address,
    String bannerHeadline,
    String bannerSubheadline,
    BigDecimal shippingFee,
    BigDecimal freeShippingThreshold
) {}
