package com.amazingdeal.commerce.modules.tenant.entity;

import com.amazingdeal.commerce.core.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "tenants")
public class Tenant extends BaseEntity {

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "custom_domain", unique = true)
    private String customDomain;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "logo_url", length = 1024)
    private String logoUrl;

    @Column(name = "favicon_url", length = 1024)
    private String faviconUrl;

    @Column(name = "primary_color", length = 32)
    private String primaryColor = "#2563eb";

    @Column(name = "accent_color", length = 32)
    private String accentColor = "#1e40af";

    @Column(name = "currency", length = 10)
    private String currency = "INR";

    @Column(name = "currency_symbol", length = 10)
    private String currencySymbol = "₹";

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "banner_headline")
    private String bannerHeadline;

    @Column(name = "banner_subheadline", columnDefinition = "TEXT")
    private String bannerSubheadline;

    @Column(name = "allow_guest_checkout", nullable = false)
    private boolean allowGuestCheckout = true;

    @Column(name = "enable_cod", nullable = false)
    private boolean enableCod = true;

    @Column(name = "enable_online_payment", nullable = false)
    private boolean enableOnlinePayment = false;

    @Column(name = "min_order_amount", precision = 12, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "tax_rate_percent", precision = 5, scale = 2)
    private BigDecimal taxRatePercent = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "free_shipping_threshold", precision = 12, scale = 2)
    private BigDecimal freeShippingThreshold;

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCustomDomain() {
        return customDomain;
    }

    public void setCustomDomain(String customDomain) {
        this.customDomain = customDomain;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getFaviconUrl() {
        return faviconUrl;
    }

    public void setFaviconUrl(String faviconUrl) {
        this.faviconUrl = faviconUrl;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBannerHeadline() {
        return bannerHeadline;
    }

    public void setBannerHeadline(String bannerHeadline) {
        this.bannerHeadline = bannerHeadline;
    }

    public String getBannerSubheadline() {
        return bannerSubheadline;
    }

    public void setBannerSubheadline(String bannerSubheadline) {
        this.bannerSubheadline = bannerSubheadline;
    }

    public boolean isAllowGuestCheckout() {
        return allowGuestCheckout;
    }

    public void setAllowGuestCheckout(boolean allowGuestCheckout) {
        this.allowGuestCheckout = allowGuestCheckout;
    }

    public boolean isEnableCod() {
        return enableCod;
    }

    public void setEnableCod(boolean enableCod) {
        this.enableCod = enableCod;
    }

    public boolean isEnableOnlinePayment() {
        return enableOnlinePayment;
    }

    public void setEnableOnlinePayment(boolean enableOnlinePayment) {
        this.enableOnlinePayment = enableOnlinePayment;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public BigDecimal getTaxRatePercent() {
        return taxRatePercent;
    }

    public void setTaxRatePercent(BigDecimal taxRatePercent) {
        this.taxRatePercent = taxRatePercent;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }
}
