package com.amazingdeal.commerce.core.multitenancy;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Order(1)
public class TenantFilterAspect {

    private static final Logger log = LoggerFactory.getLogger(TenantFilterAspect.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.amazingdeal.commerce.modules..*Repository.*(..))")
    public void applyTenantFilter() {
        TenantContextHolder.getTenantId().ifPresent(this::enableFilterForTenant);
    }

    private void enableFilterForTenant(UUID tenantId) {
        try {
            Session session = entityManager.unwrap(Session.class);
            if (session != null && session.isOpen()) {
                session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            }
        } catch (Exception ex) {
            log.trace("Could not enable tenantFilter on current session: {}", ex.getMessage());
        }
    }
}
