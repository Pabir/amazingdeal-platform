import {
  ApiResponse,
  AuthResponse,
  CategoryDto,
  CreateCategoryRequest,
  CreateProductRequest,
  DashboardMetricsDto,
  OrderDto,
  PageResponse,
  ProductDto,
  TenantDto,
  UpdateOrderStatusRequest,
  UpdateProductRequest,
  UpdateTenantRequest
} from '@amazingdeal/shared-types';

const DEFAULT_API_URL = 'https://amazingdeal-commerce-api-2pab.onrender.com/api/v1';

// If an environment variable still points to the old suspended service, ignore it
const envApiUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const sanitizedEnvUrl =
  envApiUrl && !envApiUrl.includes('amazingdeal-commerce-api.onrender.com')
    ? envApiUrl
    : undefined;

const rawUrl =
  (typeof window !== 'undefined' && localStorage.getItem('admin_api_base_url')) ||
  sanitizedEnvUrl ||
  DEFAULT_API_URL;

const API_BASE_URL = rawUrl.endsWith('/api/v1')
  ? rawUrl.replace(/\/$/, '')
  : `${rawUrl.replace(/\/$/, '')}/api/v1`;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_tenant');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorBody.message || errorBody.error || `Request failed with status ${res.status}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// Authentication
export async function loginMerchant(email: string, password: string, tenantSlug?: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, tenantSlug }),
  });
}

// Dashboard
export async function getDashboardStats(): Promise<DashboardMetricsDto> {
  return request<DashboardMetricsDto>('/admin/dashboard');
}

// Store & Settings
export async function getAdminTenant(): Promise<TenantDto> {
  return request<TenantDto>('/admin/tenant');
}

export async function updateAdminTenant(data: UpdateTenantRequest): Promise<TenantDto> {
  return request<TenantDto>('/admin/tenant', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Categories
export async function getAdminCategories(): Promise<CategoryDto[]> {
  return request<CategoryDto[]>('/admin/categories');
}

export async function createAdminCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
  return request<CategoryDto>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Products
export async function getAdminProducts(page = 0, size = 50): Promise<PageResponse<ProductDto>> {
  return request<PageResponse<ProductDto>>(`/admin/products?page=${page}&size=${size}`);
}

export async function createAdminProduct(data: CreateProductRequest): Promise<ProductDto> {
  return request<ProductDto>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminProduct(id: string, data: UpdateProductRequest): Promise<ProductDto> {
  return request<ProductDto>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminProduct(id: string): Promise<void> {
  return request<void>(`/admin/products/${id}`, {
    method: 'DELETE',
  });
}

// Orders
export async function getAdminOrders(page = 0, size = 50): Promise<PageResponse<OrderDto>> {
  return request<PageResponse<OrderDto>>(`/admin/orders?page=${page}&size=${size}`);
}

export async function updateAdminOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<OrderDto> {
  return request<OrderDto>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Media Upload
export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorBody.message || 'Image upload failed');
  }

  const json: ApiResponse<{ url: string; filename: string }> = await res.json();
  let mediaUrl = json.data?.url || '';

  // If backend returned a localhost URL while the client is communicating with a remote backend,
  // remap to the actual public backend domain
  if (mediaUrl.includes('localhost:8080/media/')) {
    const filename = json.data?.filename || mediaUrl.split('/media/').pop();
    const backendOrigin = new URL(API_BASE_URL).origin;
    mediaUrl = `${backendOrigin}/media/${filename}`;
  }

  return mediaUrl;
}
