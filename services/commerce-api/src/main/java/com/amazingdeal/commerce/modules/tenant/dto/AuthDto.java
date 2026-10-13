package com.amazingdeal.commerce.modules.tenant.dto;

import com.amazingdeal.commerce.modules.tenant.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public final class AuthDto {

    private AuthDto() {}

    public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        String password,

        String tenantSlug
    ) {}

    public record RegisterMerchantRequest(
        @NotBlank(message = "Store slug is required")
        String slug,

        @NotBlank(message = "Business name is required")
        String businessName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        String phone
    ) {}

    public record UserDto(
        UUID id,
        UUID tenantId,
        String email,
        String fullName,
        String role,
        String phone
    ) {
        public static UserDto from(User u) {
            return new UserDto(u.getId(), u.getTenantId(), u.getEmail(), u.getFullName(), u.getRole(), u.getPhone());
        }
    }

    public record AuthResponse(
        String token,
        long expiresIn,
        UserDto user,
        TenantDto tenant
    ) {}
}
