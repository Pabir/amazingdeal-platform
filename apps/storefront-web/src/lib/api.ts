import {
  ApiResponse,
  CategoryDto,
  PageResponse,
  ProductDto,
  TenantDto,
  CartDto,
  AddToCartRequest,
  CreateOrderRequest,
  OrderDto
} from '@amazingdeal/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithTenant<T>(
  endpoint: string,
  tenantSlug: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Tenant-Slug', tenantSlug);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: options.cache || 'no-store', // Ensures fresh data for multi-tenant rendering
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export async function getTenant(tenantSlug: string): Promise<TenantDto> {
  return fetchWithTenant<TenantDto>(`/storefront/tenant/${tenantSlug}`, tenantSlug);
}

export async function getCategories(tenantSlug: string): Promise<CategoryDto[]> {
  return fetchWithTenant<CategoryDto[]>('/storefront/categories', tenantSlug);
}

export async function getProducts(
  tenantSlug: string,
  params?: { categoryId?: string; search?: string; featured?: boolean }
): Promise<PageResponse<ProductDto>> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.search) query.set('search', params.search);
  if (params?.featured !== undefined) query.set('featured', String(params.featured));

  const qs = query.toString();
  return fetchWithTenant<PageResponse<ProductDto>>(
    `/storefront/products${qs ? `?${qs}` : ''}`,
    tenantSlug
  );
}

export async function getProduct(tenantSlug: string, slug: string): Promise<ProductDto> {
  return fetchWithTenant<ProductDto>(`/storefront/products/${slug}`, tenantSlug);
}

export async function getCart(tenantSlug: string, sessionId?: string): Promise<CartDto> {
  const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  return fetchWithTenant<CartDto>(`/storefront/cart${qs}`, tenantSlug);
}

export async function addToCart(tenantSlug: string, data: AddToCartRequest): Promise<CartDto> {
  return fetchWithTenant<CartDto>('/storefront/cart/items', tenantSlug, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCartItemQuantity(
  tenantSlug: string,
  itemId: string,
  quantity: number,
  sessionId?: string
): Promise<CartDto> {
  const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  return fetchWithTenant<CartDto>(`/storefront/cart/items/${itemId}${qs}`, tenantSlug, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(
  tenantSlug: string,
  itemId: string,
  sessionId?: string
): Promise<CartDto> {
  const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  return fetchWithTenant<CartDto>(`/storefront/cart/items/${itemId}${qs}`, tenantSlug, {
    method: 'DELETE',
  });
}

export async function createOrder(
  tenantSlug: string,
  data: CreateOrderRequest
): Promise<OrderDto> {
  return fetchWithTenant<OrderDto>('/storefront/orders', tenantSlug, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrderByNumber(
  tenantSlug: string,
  orderNumber: string
): Promise<OrderDto> {
  return fetchWithTenant<OrderDto>(`/storefront/orders/${orderNumber}`, tenantSlug);
}
