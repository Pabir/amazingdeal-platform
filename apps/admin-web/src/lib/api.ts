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

const API_BASE_URL = 'http://localhost:8080/api/v1';

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
