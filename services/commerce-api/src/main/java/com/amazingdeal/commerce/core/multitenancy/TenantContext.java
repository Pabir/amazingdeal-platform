package com.amazingdeal.commerce.core.multitenancy;

import java.util.UUID;

public record TenantContext(
    UUID tenantId,
    String slug,
    String host
) {
    public static TenantContext of(UUID tenantId, String slug) {
        return new TenantContext(tenantId, slug, null);
    }
}
