package com.amazingdeal.commerce.core.events;

import com.amazingdeal.commerce.core.multitenancy.TenantContext;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.modules.catalog.service.CatalogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class OrderDomainEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderDomainEventListener.class);

    private final CatalogService catalogService;

    public OrderDomainEventListener(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("Processing OrderPlacedEvent for order: {} on tenant: {}", event.orderNumber(), event.tenantId());

        var priorContext = TenantContextHolder.getContext();
        TenantContextHolder.setContext(new TenantContext(event.tenantId(), null, null));
        try {
            // 1. Decrement inventory stock
            for (OrderPlacedEvent.OrderItemDetail item : event.items()) {
                catalogService.decrementStock(item.productId(), item.variantId(), item.quantity());
                log.info("Decremented stock for product '{}' (quantity: {})", item.title(), item.quantity());
            }

            // 2. Dispatch simulated WhatsApp / SMS / Email merchant notification
            sendMerchantNotification(event);
        } finally {
            if (priorContext.isPresent()) {
                TenantContextHolder.setContext(priorContext.get());
            } else {
                TenantContextHolder.clear();
            }
        }
    }

    @Async
    public void sendMerchantNotification(OrderPlacedEvent event) {
        log.info("[NOTIFICATION] WhatsApp / Email triggered for Order #{} - Customer: {} ({}) - Total: ₹{}",
            event.orderNumber(), event.customerName(), event.customerPhone(), event.totalAmount());
    }
}
