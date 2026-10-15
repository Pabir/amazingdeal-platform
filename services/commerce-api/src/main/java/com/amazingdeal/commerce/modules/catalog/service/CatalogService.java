package com.amazingdeal.commerce.modules.catalog.service;

import com.amazingdeal.commerce.core.common.BadRequestException;
import com.amazingdeal.commerce.core.common.ResourceNotFoundException;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.modules.catalog.dto.CategoryDto;
import com.amazingdeal.commerce.modules.catalog.dto.CreateCategoryRequest;
import com.amazingdeal.commerce.modules.catalog.dto.CreateProductRequest;
import com.amazingdeal.commerce.modules.catalog.dto.ProductDto;
import com.amazingdeal.commerce.modules.catalog.dto.UpdateProductRequest;
import com.amazingdeal.commerce.modules.catalog.entity.Category;
import com.amazingdeal.commerce.modules.catalog.entity.Product;
import com.amazingdeal.commerce.modules.catalog.entity.ProductVariant;
import com.amazingdeal.commerce.modules.catalog.repository.CategoryRepository;
import com.amazingdeal.commerce.modules.catalog.repository.ProductRepository;
import com.amazingdeal.commerce.modules.catalog.repository.ProductVariantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CatalogService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CategoryRepository categoryRepository;

    public CatalogService(
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository,
        CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.categoryRepository = categoryRepository;
    }

    // ==========================================
    // Category Operations
    // ==========================================

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        String slug = request.slug().toLowerCase().trim();
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category slug '" + slug + "' already exists");
        }

        Category category = new Category();
        category.setName(request.name());
        category.setSlug(slug);
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        category.setParentId(request.parentId());
        if (request.displayOrder() != null) category.setDisplayOrder(request.displayOrder());

        category = categoryRepository.save(category);
        return CategoryDto.from(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
            .stream()
            .map(CategoryDto::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug.toLowerCase().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return CategoryDto.from(category);
    }

    // ==========================================
    // Product Operations
    // ==========================================

    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        String slug = request.slug().toLowerCase().trim();
        if (productRepository.existsBySlug(slug)) {
            throw new BadRequestException("Product slug '" + slug + "' already exists");
        }
        if (productRepository.existsBySku(request.sku())) {
            throw new BadRequestException("Product SKU '" + request.sku() + "' already exists");
        }

        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setTitle(request.title());
        product.setSlug(slug);
        product.setDescription(request.description());
        product.setShortDescription(request.shortDescription());
        product.setPrice(request.price());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setCostPrice(request.costPrice());
        product.setSku(request.sku());
        product.setStockQuantity(request.stockQuantity());
        product.setImages(request.images() != null ? request.images() : "[]");
        product.setCategoryId(request.categoryId());
        if (request.featured() != null) product.setFeatured(request.featured());
        if (request.active() != null) product.setActive(request.active());
        if (request.tags() != null) product.setTags(request.tags());

        if (request.variants() != null && !request.variants().isEmpty()) {
            List<ProductVariant> variants = new ArrayList<>();
            UUID currentTenantId = TenantContextHolder.requireTenantId();
            for (CreateProductRequest.CreateVariantRequest vReq : request.variants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProductId(product.getId());
                variant.setTenantId(currentTenantId);
                variant.setSku(vReq.sku());
                variant.setTitle(vReq.title());
                variant.setPrice(vReq.price());
                variant.setCompareAtPrice(vReq.compareAtPrice());
                variant.setStockQuantity(vReq.stockQuantity());
                variant.setOptions(vReq.options() != null ? vReq.options() : "{}");
                variants.add(variant);
            }
            product.setVariants(variants);
        }

        product = productRepository.save(product);
        return ProductDto.from(product);
    }

    @Transactional
    public ProductDto updateProduct(UUID productId, UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        UUID currentTenantId = TenantContextHolder.getTenantId().orElse(product.getTenantId());
        if (!product.getTenantId().equals(currentTenantId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        if (request.title() != null) product.setTitle(request.title());
        if (request.slug() != null) {
            String slug = request.slug().toLowerCase().trim();
            productRepository.findBySlug(slug).ifPresent(existing -> {
                if (!existing.getId().equals(productId)) {
                    throw new BadRequestException("Product slug '" + slug + "' is already in use");
                }
            });
            product.setSlug(slug);
        }
        if (request.description() != null) product.setDescription(request.description());
        if (request.shortDescription() != null) product.setShortDescription(request.shortDescription());
        if (request.price() != null) product.setPrice(request.price());
        if (request.compareAtPrice() != null) product.setCompareAtPrice(request.compareAtPrice());
        if (request.costPrice() != null) product.setCostPrice(request.costPrice());
        if (request.sku() != null) {
            productRepository.findBySku(request.sku()).ifPresent(existing -> {
                if (!existing.getId().equals(productId)) {
                    throw new BadRequestException("Product SKU '" + request.sku() + "' is already in use");
                }
            });
            product.setSku(request.sku());
        }
        if (request.stockQuantity() != null) product.setStockQuantity(request.stockQuantity());
        if (request.images() != null) product.setImages(request.images());
        if (request.categoryId() != null) product.setCategoryId(request.categoryId());
        if (request.featured() != null) product.setFeatured(request.featured());
        if (request.active() != null) product.setActive(request.active());
        if (request.tags() != null) product.setTags(request.tags());

        if (request.variants() != null) {
            product.getVariants().clear();
            for (CreateProductRequest.CreateVariantRequest vReq : request.variants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProductId(product.getId());
                variant.setTenantId(product.getTenantId());
                variant.setSku(vReq.sku());
                variant.setTitle(vReq.title());
                variant.setPrice(vReq.price());
                variant.setCompareAtPrice(vReq.compareAtPrice());
                variant.setStockQuantity(vReq.stockQuantity());
                variant.setOptions(vReq.options() != null ? vReq.options() : "{}");
                product.getVariants().add(variant);
            }
        }

        product = productRepository.save(product);
        return ProductDto.from(product);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        TenantContextHolder.getTenantId().ifPresent(currentTenantId -> {
            if (!product.getTenantId().equals(currentTenantId)) {
                throw new ResourceNotFoundException("Product not found with id: " + productId);
            }
        });
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        TenantContextHolder.getTenantId().ifPresent(currentTenantId -> {
            if (!product.getTenantId().equals(currentTenantId)) {
                throw new ResourceNotFoundException("Product not found with id: " + productId);
            }
        });
        return ProductDto.from(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug.toLowerCase().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return ProductDto.from(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getStorefrontProducts(UUID categoryId, Boolean featured, String search, Pageable pageable) {
        Page<Product> page;
        if (search != null && !search.isBlank()) {
            page = productRepository.searchStorefrontProducts(search.trim(), pageable);
        } else if (Boolean.TRUE.equals(featured)) {
            page = productRepository.findByActiveTrueAndFeaturedTrue(pageable);
        } else if (categoryId != null) {
            page = productRepository.findByActiveTrueAndCategoryId(categoryId, pageable);
        } else {
            page = productRepository.findByActiveTrue(pageable);
        }
        return page.map(ProductDto::from);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getAdminProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(ProductDto::from);
    }

    @Transactional
    public void decrementStock(UUID productId, UUID variantId, int quantity) {
        if (productId == null || quantity <= 0) return;

        productRepository.findById(productId).ifPresent(product -> {
            int currentStock = product.getStockQuantity();
            product.setStockQuantity(Math.max(0, currentStock - quantity));
            productRepository.save(product);
        });

        if (variantId != null) {
            productVariantRepository.findById(variantId).ifPresent(variant -> {
                int currentVariantStock = variant.getStockQuantity();
                variant.setStockQuantity(Math.max(0, currentVariantStock - quantity));
                productVariantRepository.save(variant);
            });
        }
    }
}
