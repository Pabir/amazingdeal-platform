package com.amazingdeal.commerce.modules.tenant.controller;

import com.amazingdeal.commerce.core.common.ApiResponse;
import com.amazingdeal.commerce.core.security.UserPrincipal;
import com.amazingdeal.commerce.modules.tenant.dto.AuthDto;
import com.amazingdeal.commerce.modules.tenant.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(@Valid @RequestBody AuthDto.RegisterMerchantRequest request) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Merchant store registered successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        AuthDto.UserDto user = authService.getCurrentUser(principal.id());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
