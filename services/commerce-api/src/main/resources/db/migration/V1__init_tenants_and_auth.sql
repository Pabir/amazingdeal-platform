-- V1__init_tenants_and_auth.sql
-- Core Tenants, Settings, and Users Schema

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    store_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(1024),
    favicon_url VARCHAR(1024),
    primary_color VARCHAR(32) DEFAULT '#2563eb',
    accent_color VARCHAR(32) DEFAULT '#1e40af',
    currency VARCHAR(10) DEFAULT 'INR',
    currency_symbol VARCHAR(10) DEFAULT '₹',
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    banner_headline VARCHAR(255),
    banner_subheadline TEXT,
    allow_guest_checkout BOOLEAN NOT NULL DEFAULT TRUE,
    enable_cod BOOLEAN NOT NULL DEFAULT TRUE,
    enable_online_payment BOOLEAN NOT NULL DEFAULT FALSE,
    min_order_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_rate_percent NUMERIC(5, 2) DEFAULT 0.00,
    shipping_fee NUMERIC(12, 2) DEFAULT 0.00,
    free_shipping_threshold NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
