package com.amazingdeal.commerce.modules.cart.service;

import com.amazingdeal.commerce.core.common.BadRequestException;
import com.amazingdeal.commerce.core.common.ResourceNotFoundException;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.modules.cart.dto.AddToCartRequest;
import com.amazingdeal.commerce.modules.cart.dto.CartDto;
import com.amazingdeal.commerce.modules.cart.dto.CartItemDto;
import com.amazingdeal.commerce.modules.cart.dto.UpdateCartItemQuantityRequest;
import com.amazingdeal.commerce.modules.cart.entity.Cart;
import com.amazingdeal.commerce.modules.cart.entity.CartItem;
import com.amazingdeal.commerce.modules.cart.repository.CartItemRepository;
import com.amazingdeal.commerce.modules.cart.repository.CartRepository;
import com.amazingdeal.commerce.modules.catalog.entity.Product;
import com.amazingdeal.commerce.modules.catalog.entity.ProductVariant;
import com.amazingdeal.commerce.modules.catalog.repository.ProductRepository;
import com.amazingdeal.commerce.modules.catalog.repository.ProductVariantRepository;
import com.amazingdeal.commerce.modules.tenant.entity.Tenant;
import com.amazingdeal.commerce.modules.tenant.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final TenantRepository tenantRepository;

    public CartService(
        CartRepository cartRepository,
        CartItemRepository cartItemRepository,
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository,
        TenantRepository tenantRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional
    public Cart getOrCreateCart(String sessionId, UUID userId) {
        if (userId != null) {
            Optional<Cart> userCart = cartRepository.findByUserId(userId);
            if (userCart.isPresent()) return userCart.get();
        }

        if (sessionId != null && !sessionId.isBlank()) {
            Optional<Cart> sessionCart = cartRepository.findBySessionId(sessionId);
            if (sessionCart.isPresent()) return sessionCart.get();
        }

        Cart cart = new Cart();
        cart.setSessionId(sessionId);
        cart.setUserId(userId);
        return cartRepository.save(cart);
    }

    @Transactional
    public CartDto getCartDto(String sessionId, UUID userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        return buildCartDto(cart);
    }

    @Transactional
    public CartDto addItemToCart(AddToCartRequest request, UUID userId) {
        Cart cart = getOrCreateCart(request.sessionId(), userId);

        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.productId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is not available for purchase");
        }

        BigDecimal unitPrice = product.getPrice();
        int availableStock = product.getStockQuantity();
        String variantTitle = null;

        if (request.variantId() != null) {
            ProductVariant variant = productVariantRepository.findById(request.variantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found: " + request.variantId()));
            unitPrice = variant.getPrice();
            availableStock = variant.getStockQuantity();
            variantTitle = variant.getTitle();
        }

        if (availableStock < request.quantity()) {
            throw new BadRequestException("Requested quantity (" + request.quantity() + ") exceeds available stock (" + availableStock + ")");
        }

        Optional<CartItem> existingItem = request.variantId() != null
            ? cartItemRepository.findByCartIdAndProductIdAndVariantId(cart.getId(), request.productId(), request.variantId())
            : cartItemRepository.findByCartIdAndProductIdAndVariantIdIsNull(cart.getId(), request.productId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.quantity();
            if (availableStock < newQuantity) {
                throw new BadRequestException("Total quantity in cart would exceed available stock (" + availableStock + ")");
            }
            item.setQuantity(newQuantity);
            item.setUnitPrice(unitPrice);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCartId(cart.getId());
            newItem.setProductId(request.productId());
            newItem.setVariantId(request.variantId());
            newItem.setQuantity(request.quantity());
            newItem.setUnitPrice(unitPrice);
            cartItemRepository.save(newItem);
        }

        return buildCartDto(cart);
    }

    @Transactional
    public CartDto updateItemQuantity(UUID itemId, UpdateCartItemQuantityRequest request, String sessionId, UUID userId) {
        Cart cart = getOrCreateCart(sessionId, userId);

        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        if (!item.getCartId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to the current cart");
        }

        if (request.quantity() <= 0) {
            cartItemRepository.delete(item);
        } else {
            // Verify stock
            Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            int availableStock = item.getVariantId() != null
                ? productVariantRepository.findById(item.getVariantId()).map(ProductVariant::getStockQuantity).orElse(0)
                : product.getStockQuantity();

            if (availableStock < request.quantity()) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + availableStock + ")");
            }

            item.setQuantity(request.quantity());
            cartItemRepository.save(item);
        }

        return buildCartDto(cart);
    }

    @Transactional
    public CartDto removeItem(UUID itemId, String sessionId, UUID userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        if (item.getCartId().equals(cart.getId())) {
            cartItemRepository.delete(item);
        }

        return buildCartDto(cart);
    }

    @Transactional
    public void clearCart(UUID cartId) {
        cartItemRepository.deleteByCartId(cartId);
    }

    private CartDto buildCartDto(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemDto> itemDtos = new ArrayList<>();

        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItemCount = 0;

        for (CartItem item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) continue;

            String variantTitle = null;
            int availableStock = product.getStockQuantity();
            if (item.getVariantId() != null) {
                ProductVariant variant = productVariantRepository.findById(item.getVariantId()).orElse(null);
                if (variant != null) {
                    variantTitle = variant.getTitle();
                    availableStock = variant.getStockQuantity();
                }
            }

            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            totalItemCount += item.getQuantity();

            // Parse first image
            String firstImage = null;
            if (product.getImages() != null && product.getImages().contains("http")) {
                firstImage = product.getImages().replaceAll("[\\[\\]\"']", "").split(",")[0].trim();
            }

            itemDtos.add(new CartItemDto(
                item.getId(),
                product.getId(),
                product.getTitle(),
                product.getSlug(),
                firstImage,
                item.getVariantId(),
                variantTitle,
                item.getUnitPrice(),
                item.getQuantity(),
                lineTotal,
                availableStock
            ));
        }

        // Apply tenant shipping and tax settings
        UUID tenantId = cart.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);

        BigDecimal taxRate = tenant != null && tenant.getTaxRatePercent() != null ? tenant.getTaxRatePercent() : BigDecimal.ZERO;
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal shippingFee = BigDecimal.ZERO;
        if (tenant != null && tenant.getShippingFee() != null && subtotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal freeThreshold = tenant.getFreeShippingThreshold();
            if (freeThreshold == null || subtotal.compareTo(freeThreshold) < 0) {
                shippingFee = tenant.getShippingFee();
            }
        }

        BigDecimal total = subtotal.add(taxAmount).add(shippingFee);

        return new CartDto(
            cart.getId(),
            cart.getTenantId(),
            cart.getSessionId(),
            cart.getUserId(),
            itemDtos,
            subtotal,
            taxAmount,
            shippingFee,
            total,
            totalItemCount
        );
    }
}
