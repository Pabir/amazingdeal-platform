package com.amazingdeal.commerce.core.multitenancy;

import com.amazingdeal.commerce.core.security.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class TenantContextFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantContextFilter.class);

    private final TenantResolver tenantResolver;
    private final JwtTokenProvider jwtTokenProvider;

    public TenantContextFilter(TenantResolver tenantResolver, JwtTokenProvider jwtTokenProvider) {
        this.tenantResolver = tenantResolver;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            Optional<TenantContext> resolvedContext = resolveTenant(request);
            resolvedContext.ifPresent(context -> {
                TenantContextHolder.setContext(context);
                response.setHeader("X-Resolved-Tenant-ID", context.tenantId().toString());
                response.setHeader("X-Resolved-Tenant-Slug", context.slug());
            });

            filterChain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
        }
    }

    private Optional<TenantContext> resolveTenant(HttpServletRequest request) {
        // 1. Admin Requests: JWT claims take precedence
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                UUID jwtTenantId = jwtTokenProvider.extractTenantId(token);
                if (jwtTenantId != null) {
                    return tenantResolver.resolveById(jwtTenantId);
                }
            }
        }

        // 2. Development / Explicit X-Tenant-ID header fallback
        String tenantIdHeader = request.getHeader("X-Tenant-ID");
        if (StringUtils.hasText(tenantIdHeader)) {
            try {
                UUID tenantId = UUID.fromString(tenantIdHeader.trim());
                return tenantResolver.resolveById(tenantId);
            } catch (IllegalArgumentException ex) {
                log.warn("Invalid X-Tenant-ID header format: {}", tenantIdHeader);
            }
        }

        // 3. Storefront / Proxy X-Tenant-Slug header fallback
        String tenantSlugHeader = request.getHeader("X-Tenant-Slug");
        if (StringUtils.hasText(tenantSlugHeader)) {
            return tenantResolver.resolveBySlug(tenantSlugHeader.trim());
        }

        // 4. Buyer Storefront: Host header resolution (e.g., footwear.platform.com or footwear.com)
        String host = request.getHeader("Host");
        if (StringUtils.hasText(host)) {
            Optional<TenantContext> hostContext = tenantResolver.resolveByHost(host);
            if (hostContext.isPresent()) {
                return hostContext;
            }
        }

        return Optional.empty();
    }
}
