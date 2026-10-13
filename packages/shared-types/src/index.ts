// ==========================================
// Base & Utility Types
// ==========================================

export interface BaseEntityDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseTenantEntityDto extends BaseEntityDto {
  tenantId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

// ==========================================
// Tenant Module
// ==========================================

export interface TenantBranding {
  storeName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  accentColor: string;
  currency: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  bannerHeadline?: string;
  bannerSubheadline?: string;
}

export interface TenantSettings {
  allowGuestCheckout: boolean;
  enableCod: boolean;
  enableOnlinePayment: boolean;
  minOrderAmount: number;
  taxRatePercent: number;
  shippingFee: number;
  freeShippingThreshold?: number;
}

export interface TenantDto extends BaseEntityDto {
  slug: string;
  businessName: string;
  customDomain?: string;
  active: boolean;
  branding: TenantBranding;
  settings: TenantSettings;
}

export interface CreateTenantRequest {
  slug: string;
  businessName: string;
  merchantEmail: string;
  merchantPassword: string;
  merchantFullName: string;
  branding?: Partial<TenantBranding>;
  settings?: Partial<TenantSettings>;
}

export interface UpdateTenantRequest {
  businessName?: string;
  storeName?: string;
  customDomain?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  currency?: string;
  currencySymbol?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  bannerHeadline?: string;
  bannerSubheadline?: string;
  allowGuestCheckout?: boolean;
  enableCod?: boolean;
  enableOnlinePayment?: boolean;
  minOrderAmount?: number;
  taxRatePercent?: number;
  shippingFee?: number;
  freeShippingThreshold?: number;
  branding?: Partial<TenantBranding>;
  settings?: Partial<TenantSettings>;
}

// ==========================================
// Authentication & User Module
// ==========================================

export type UserRole = 'SUPER_ADMIN' | 'MERCHANT_ADMIN' | 'STORE_STAFF' | 'BUYER';

export interface AuthUserDto {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: AuthUserDto;
  tenant?: TenantDto;
}

// ==========================================
// Catalog Module
// ==========================================

export interface CategoryDto extends BaseTenantEntityDto {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  displayOrder: number;
  active: boolean;
  productCount?: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  displayOrder?: number;
}

export interface ProductVariantDto extends BaseTenantEntityDto {
  productId: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  options: Record<string, string>; // e.g. {"Size": "US 10", "Color": "Navy"}
}

export interface ProductDto extends BaseTenantEntityDto {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  stockQuantity: number;
  inStock: boolean;
  images: string | string[];
  categoryId?: string;
  categoryName?: string;
  featured: boolean;
  active: boolean;
  tags?: string | string[];
  variants: ProductVariantDto[];
}

export interface CreateProductRequest {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  stockQuantity: number;
  images?: string | string[];
  categoryId?: string;
  featured?: boolean;
  active?: boolean;
  tags?: string | string[];
  variants?: Array<Omit<ProductVariantDto, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'productId'>>;
}

export interface UpdateProductRequest {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  stockQuantity?: number;
  images?: string | string[];
  categoryId?: string;
  featured?: boolean;
  active?: boolean;
  tags?: string[];
  variants?: Array<Omit<ProductVariantDto, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'productId'>>;
}

// ==========================================
// Cart Module
// ==========================================

export interface CartItemDto {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  variantId?: string;
  variantTitle?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
}

export interface CartDto {
  id: string;
  tenantId: string;
  sessionId?: string;
  userId?: string;
  items: CartItemDto[];
  subtotal: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  sessionId?: string;
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}

// ==========================================
// Order Module
// ==========================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'ONLINE_RAZORPAY' | 'ONLINE_STRIPE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface ShippingAddressDto {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemDto extends BaseTenantEntityDto {
  orderId: string;
  productId: string;
  productTitle: string;
  productSku: string;
  productImage?: string;
  variantId?: string;
  variantTitle?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderTimelineEventDto {
  id: string;
  timestamp: string;
  status: OrderStatus;
  note: string;
}

export interface OrderDto extends BaseTenantEntityDto {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string | ShippingAddressDto;
  items: OrderItemDto[];
  subtotal: number;
  taxAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  timeline?: string | OrderTimelineEventDto[];
}

export interface CreateOrderRequest {
  cartId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string | ShippingAddressDto;
  paymentMethod: PaymentMethod;
  notes?: string;
  // If direct checkout without prior cart
  directItems?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

// ==========================================
// Media Module
// ==========================================

export interface MediaUploadResponse {
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

// ==========================================
// Analytics / Dashboard Module
// ==========================================

export interface DashboardMetricsDto {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  recentOrders: OrderDto[];
}
