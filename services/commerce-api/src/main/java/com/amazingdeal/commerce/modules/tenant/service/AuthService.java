package com.amazingdeal.commerce.modules.tenant.service;

import com.amazingdeal.commerce.core.common.BadRequestException;
import com.amazingdeal.commerce.core.common.UnauthorizedException;
import com.amazingdeal.commerce.core.multitenancy.TenantContextHolder;
import com.amazingdeal.commerce.core.security.JwtTokenProvider;
import com.amazingdeal.commerce.core.security.UserPrincipal;
import com.amazingdeal.commerce.modules.tenant.dto.AuthDto;
import com.amazingdeal.commerce.modules.tenant.dto.CreateTenantRequest;
import com.amazingdeal.commerce.modules.tenant.dto.TenantDto;
import com.amazingdeal.commerce.modules.tenant.entity.Tenant;
import com.amazingdeal.commerce.modules.tenant.entity.User;
import com.amazingdeal.commerce.modules.tenant.repository.TenantRepository;
import com.amazingdeal.commerce.modules.tenant.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final TenantService tenantService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
        UserRepository userRepository,
        TenantRepository tenantRepository,
        TenantService tenantService,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.tenantService = tenantService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String email = request.email().toLowerCase().trim();

        // If tenantSlug is passed or in context, lookup by tenant
        Optional<UUID> contextTenantId = TenantContextHolder.getTenantId();
        User user;

        if (request.tenantSlug() != null && !request.tenantSlug().isBlank()) {
            Tenant tenant = tenantRepository.findBySlug(request.tenantSlug().toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("Store not found: " + request.tenantSlug()));
            user = userRepository.findByEmailAndTenantId(email, tenant.getId())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        } else if (contextTenantId.isPresent()) {
            user = userRepository.findByEmailAndTenantId(email, contextTenantId.get())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        } else {
            // General login fallback: find by email
            user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        Tenant tenant = tenantRepository.findById(user.getTenantId())
            .orElseThrow(() -> new UnauthorizedException("Associated store not found"));

        if (!tenant.isActive()) {
            throw new UnauthorizedException("Store account is currently inactive");
        }

        UserPrincipal principal = UserPrincipal.create(
            user.getId(),
            user.getTenantId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getFullName(),
            user.getRole(),
            user.isActive()
        );

        String token = jwtTokenProvider.generateToken(principal);

        return new AuthDto.AuthResponse(
            token,
            86400,
            AuthDto.UserDto.from(user),
            TenantDto.from(tenant)
        );
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterMerchantRequest request) {
        CreateTenantRequest tenantReq = new CreateTenantRequest(
            request.slug(),
            request.businessName(),
            request.email(),
            request.password(),
            request.fullName(),
            request.businessName(),
            null,
            null,
            "#2563eb",
            "#1e40af",
            "INR",
            "₹",
            request.phone(),
            null,
            "Welcome to " + request.businessName(),
            "Explore our high-quality collection",
            null,
            null
        );

        TenantDto tenantDto = tenantService.createTenant(tenantReq);

        User user = userRepository.findByEmailAndTenantId(request.email().toLowerCase().trim(), tenantDto.id())
            .orElseThrow(() -> new IllegalStateException("Admin user was not created"));

        UserPrincipal principal = UserPrincipal.create(
            user.getId(),
            user.getTenantId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getFullName(),
            user.getRole(),
            user.isActive()
        );

        String token = jwtTokenProvider.generateToken(principal);

        return new AuthDto.AuthResponse(
            token,
            86400,
            AuthDto.UserDto.from(user),
            tenantDto
        );
    }

    @Transactional(readOnly = true)
    public AuthDto.UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        return AuthDto.UserDto.from(user);
    }
}
