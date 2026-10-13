package com.amazingdeal.commerce.core.config;

import com.amazingdeal.commerce.core.multitenancy.TenantContext;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.modules.catalog.dto.CreateCategoryRequest;
import com.amazingdeal.commerce.modules.catalog.dto.CreateProductRequest;
import com.amazingdeal.commerce.modules.catalog.service.CatalogService;
import com.amazingdeal.commerce.modules.tenant.dto.CreateTenantRequest;
import com.amazingdeal.commerce.modules.tenant.dto.TenantDto;
import com.amazingdeal.commerce.modules.tenant.repository.TenantRepository;
import com.amazingdeal.commerce.modules.tenant.service.TenantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final TenantRepository tenantRepository;
    private final TenantService tenantService;
    private final CatalogService catalogService;

    public DataSeeder(
        TenantRepository tenantRepository,
        TenantService tenantService,
        CatalogService catalogService
    ) {
        this.tenantRepository = tenantRepository;
        this.tenantService = tenantService;
        this.catalogService = catalogService;
    }

    @Override
    public void run(String... args) {
        if (tenantRepository.count() > 0) {
            log.info("Database already seeded with tenants. Skipping seeder.");
            return;
        }

        log.info("Seeding initial tenants and catalogs...");

        // ==========================================
        // Tenant 1: footwear (Stride Footwear Co.)
        // ==========================================
        CreateTenantRequest footwearReq = new CreateTenantRequest(
            "footwear",
            "Stride Footwear Ltd.",
            "admin@stridefootwear.com",
            "password123",
            "Alex Morgan",
            "Stride Footwear",
            "footwear.localhost",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            "#0284c7",
            "#0369a1",
            "INR",
            "₹",
            "+91 98765 43210",
            "124 Commercial Street, Bangalore, Karnataka",
            "Step Into Peak Performance",
            "Handcrafted athletic runners and luxury sneakers engineered for all-day comfort.",
            BigDecimal.valueOf(50),
            BigDecimal.valueOf(1000)
        );
        TenantDto footwearTenant = tenantService.createTenant(footwearReq);

        // Seed products for Tenant 1
        TenantContextHolder.setContext(new TenantContext(footwearTenant.id(), footwearTenant.slug(), null));
        try {
            var catRunning = catalogService.createCategory(new CreateCategoryRequest(
                "Running Shoes",
                "running-shoes",
                "High performance road and trail running shoes",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                null,
                1
            ));

            var catSneakers = catalogService.createCategory(new CreateCategoryRequest(
                "Casual Sneakers",
                "casual-sneakers",
                "Everyday street style and minimalist leather sneakers",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600",
                null,
                2
            ));

            catalogService.createProduct(new CreateProductRequest(
                "Air Velocity HyperSpeed Runner",
                "air-velocity-hyperspeed",
                "Engineered breathable mesh upper with responsive carbon-infused foam cushioning. Designed for speed, endurance, and everyday asphalt runs.",
                "Responsive carbon-infused marathon running shoe.",
                BigDecimal.valueOf(4499.00),
                BigDecimal.valueOf(5999.00),
                BigDecimal.valueOf(2500.00),
                "RUN-VEL-001",
                45,
                "[\"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800\",\"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800\"]",
                catRunning.id(),
                true,
                true,
                "[\"Running\",\"Athletic\",\"Carbon\"]",
                List.of(
                    new CreateProductRequest.CreateVariantRequest("RUN-VEL-001-UK8", "UK 8 / Crimson", BigDecimal.valueOf(4499.00), BigDecimal.valueOf(5999.00), 15, "{\"Size\":\"UK 8\"}"),
                    new CreateProductRequest.CreateVariantRequest("RUN-VEL-001-UK9", "UK 9 / Crimson", BigDecimal.valueOf(4499.00), BigDecimal.valueOf(5999.00), 18, "{\"Size\":\"UK 9\"}"),
                    new CreateProductRequest.CreateVariantRequest("RUN-VEL-001-UK10", "UK 10 / Crimson", BigDecimal.valueOf(4499.00), BigDecimal.valueOf(5999.00), 12, "{\"Size\":\"UK 10\"}")
                )
            ));

            catalogService.createProduct(new CreateProductRequest(
                "Retro Classic White Lows",
                "retro-classic-white-lows",
                "Full-grain nappa leather sneakers with ortholite comfort insole and stitched rubber cupsole. The quintessential minimalist sneaker.",
                "Full-grain nappa leather minimalist sneaker.",
                BigDecimal.valueOf(3299.00),
                BigDecimal.valueOf(3999.00),
                BigDecimal.valueOf(1800.00),
                "SNK-RET-002",
                30,
                "[\"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800\",\"https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800\"]",
                catSneakers.id(),
                true,
                true,
                "[\"Sneakers\",\"White\",\"Leather\"]",
                List.of(
                    new CreateProductRequest.CreateVariantRequest("SNK-RET-002-UK8", "UK 8 / White", BigDecimal.valueOf(3299.00), BigDecimal.valueOf(3999.00), 10, "{\"Size\":\"UK 8\"}"),
                    new CreateProductRequest.CreateVariantRequest("SNK-RET-002-UK9", "UK 9 / White", BigDecimal.valueOf(3299.00), BigDecimal.valueOf(3999.00), 12, "{\"Size\":\"UK 9\"}"),
                    new CreateProductRequest.CreateVariantRequest("SNK-RET-002-UK10", "UK 10 / White", BigDecimal.valueOf(3299.00), BigDecimal.valueOf(3999.00), 8, "{\"Size\":\"UK 10\"}")
                )
            ));
        } finally {
            TenantContextHolder.clear();
        }

        // ==========================================
        // Tenant 2: threads (Urban Threads Boutique)
        // ==========================================
        CreateTenantRequest threadsReq = new CreateTenantRequest(
            "threads",
            "Urban Threads Retailers Ltd.",
            "admin@urbanthreads.com",
            "password123",
            "Sarah Jenkins",
            "Urban Threads",
            "threads.localhost",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400",
            "#7c3aed",
            "#6d28d9",
            "INR",
            "₹",
            "+91 99887 76655",
            "88 Linking Road, Bandra West, Mumbai, Maharashtra",
            "Modern Essentials for Contemporary Living",
            "Ethically sourced, 100% organic heavy-weight cotton apparel crafted for longevity.",
            BigDecimal.valueOf(40),
            BigDecimal.valueOf(800)
        );
        TenantDto threadsTenant = tenantService.createTenant(threadsReq);

        TenantContextHolder.setContext(new TenantContext(threadsTenant.id(), threadsTenant.slug(), null));
        try {
            var catTees = catalogService.createCategory(new CreateCategoryRequest(
                "Graphic & Heavy Tees",
                "tees",
                "Heavyweight 240 GSM combed organic cotton t-shirts",
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
                null,
                1
            ));

            catalogService.createProduct(new CreateProductRequest(
                "Oversized Vintage Charcoal Tee",
                "oversized-vintage-charcoal-tee",
                "Drop-shoulder boxy fit crafted with 240 GSM combed cotton. Garment dyed for a rich vintage washed aesthetic.",
                "Drop-shoulder 240 GSM organic cotton washed tee.",
                BigDecimal.valueOf(1299.00),
                BigDecimal.valueOf(1799.00),
                BigDecimal.valueOf(600.00),
                "TEE-OVR-001",
                60,
                "[\"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800\"]",
                catTees.id(),
                true,
                true,
                "[\"T-Shirts\",\"Oversized\",\"Organic\"]",
                List.of(
                    new CreateProductRequest.CreateVariantRequest("TEE-OVR-001-M", "Medium / Charcoal", BigDecimal.valueOf(1299.00), BigDecimal.valueOf(1799.00), 25, "{\"Size\":\"M\"}"),
                    new CreateProductRequest.CreateVariantRequest("TEE-OVR-001-L", "Large / Charcoal", BigDecimal.valueOf(1299.00), BigDecimal.valueOf(1799.00), 25, "{\"Size\":\"L\"}"),
                    new CreateProductRequest.CreateVariantRequest("TEE-OVR-001-XL", "X-Large / Charcoal", BigDecimal.valueOf(1299.00), BigDecimal.valueOf(1799.00), 10, "{\"Size\":\"XL\"}")
                )
            ));
        } finally {
            TenantContextHolder.clear();
        }

        log.info("Database seeding completed successfully! Tenants seeded: 'footwear', 'threads'");
    }
}
