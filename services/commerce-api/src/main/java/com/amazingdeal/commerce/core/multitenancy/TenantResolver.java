package com.amazingdeal.commerce.core.multitenancy;

import com.amazingdeal.commerce.modules.tenant.entity.Tenant;
import com.amazingdeal.commerce.modules.tenant.repository.TenantRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TenantResolver {

    private final TenantRepository tenantRepository;
    private final ConcurrentHashMap<String, TenantContext> hostCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, TenantContext> slugCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, TenantContext> idCache = new ConcurrentHashMap<>();

    public TenantResolver(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    public Optional<TenantContext> resolveByHost(String rawHost) {
        if (rawHost == null || rawHost.isBlank()) {
            return Optional.empty();
        }

        // Strip port (e.g., footwear.localhost:3000 -> footwear.localhost)
        String host = rawHost.split(":")[0].trim().toLowerCase();

        TenantContext cached = hostCache.get(host);
        if (cached != null) {
            return Optional.of(cached);
        }

        // 1. Check custom domain match
        Optional<Tenant> byCustomDomain = tenantRepository.findByCustomDomain(host);
        if (byCustomDomain.isPresent() && byCustomDomain.get().isActive()) {
            Tenant t = byCustomDomain.get();
            TenantContext ctx = new TenantContext(t.getId(), t.getSlug(), host);
            hostCache.put(host, ctx);
            return Optional.of(ctx);
        }

        // 2. Check subdomain (e.g. footwear.platform.com or footwear.localhost)
        String[] parts = host.split("\\.");
        if (parts.length >= 2) {
            String candidateSlug = parts[0];
            // If subdomain is "admin", "api", "www", ignore
            if (!candidateSlug.equals("admin") && !candidateSlug.equals("api") && !candidateSlug.equals("www")) {
                Optional<TenantContext> ctx = resolveBySlug(candidateSlug);
                if (ctx.isPresent()) {
                    hostCache.put(host, ctx.get());
                    return ctx;
                }
            }
        }

        return Optional.empty();
    }

    public Optional<TenantContext> resolveBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return Optional.empty();
        }
        String cleanSlug = slug.trim().toLowerCase();
        TenantContext cached = slugCache.get(cleanSlug);
        if (cached != null) {
            return Optional.of(cached);
        }

        return tenantRepository.findBySlug(cleanSlug)
            .filter(Tenant::isActive)
            .map(t -> {
                TenantContext ctx = new TenantContext(t.getId(), t.getSlug(), null);
                slugCache.put(cleanSlug, ctx);
                idCache.put(t.getId(), ctx);
                return ctx;
            });
    }

    public Optional<TenantContext> resolveById(UUID tenantId) {
        if (tenantId == null) {
            return Optional.empty();
        }
        TenantContext cached = idCache.get(tenantId);
        if (cached != null) {
            return Optional.of(cached);
        }

        return tenantRepository.findById(tenantId)
            .filter(Tenant::isActive)
            .map(t -> {
                TenantContext ctx = new TenantContext(t.getId(), t.getSlug(), null);
                idCache.put(tenantId, ctx);
                slugCache.put(t.getSlug(), ctx);
                return ctx;
            });
    }

    public void evict(UUID tenantId, String slug, String customDomain) {
        if (tenantId != null) idCache.remove(tenantId);
        if (slug != null) slugCache.remove(slug.toLowerCase());
        if (customDomain != null) hostCache.remove(customDomain.toLowerCase());
    }
}
