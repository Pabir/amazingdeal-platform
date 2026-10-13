package com.amazingdeal.commerce.core.multitenancy;

import java.util.Optional;
import java.util.UUID;

public final class TenantContextHolder {

    private static final ThreadLocal<TenantContext> CONTEXT = new ThreadLocal<>();

    private TenantContextHolder() {
    }

    public static void setContext(TenantContext context) {
        CONTEXT.set(context);
    }

    public static Optional<TenantContext> getContext() {
        return Optional.ofNullable(CONTEXT.get());
    }

    public static Optional<UUID> getTenantId() {
        return getContext().map(TenantContext::tenantId);
    }

    public static UUID requireTenantId() {
        return getTenantId().orElseThrow(() ->
            new IllegalStateException("Tenant context is required but none was found on the current thread"));
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
