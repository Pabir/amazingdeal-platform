package com.amazingdeal.commerce.modules.cart.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.core.security.UserPrincipal;
import com.amazingdeal.commerce.modules.cart.dto.AddToCartRequest;
import com.amazingdeal.commerce.modules.cart.dto.CartDto;
import com.amazingdeal.commerce.modules.cart.dto.UpdateCartItemQuantityRequest;
import com.amazingdeal.commerce.modules.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/storefront/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(
        @RequestParam(required = false) String sessionId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.id() : null;
        CartDto cart = cartService.getCartDto(sessionId, userId);
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
        @Valid @RequestBody AddToCartRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.id() : null;
        CartDto cart = cartService.addItemToCart(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateItemQuantity(
        @PathVariable UUID itemId,
        @Valid @RequestBody UpdateCartItemQuantityRequest request,
        @RequestParam(required = false) String sessionId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.id() : null;
        CartDto cart = cartService.updateItemQuantity(itemId, request, sessionId, userId);
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
        @PathVariable UUID itemId,
        @RequestParam(required = false) String sessionId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = principal != null ? principal.id() : null;
        CartDto cart = cartService.removeItem(itemId, sessionId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }
}
