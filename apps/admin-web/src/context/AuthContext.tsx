import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUserDto, TenantDto } from '@amazingdeal/shared-types';
import * as api from '../lib/api';

interface AuthContextType {
  token: string | null;
  user: AuthUserDto | null;
  tenant: TenantDto | null;
  login: (email: string, password: string, tenantSlug?: string) => Promise<void>;
  logout: () => void;
  refreshTenant: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [user, setUser] = useState<AuthUserDto | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tenant, setTenant] = useState<TenantDto | null>(() => {
    const saved = localStorage.getItem('admin_tenant');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string, tenantSlug?: string) => {
    const res = await api.loginMerchant(email, password, tenantSlug);
    localStorage.setItem('admin_token', res.token);
    localStorage.setItem('admin_user', JSON.stringify(res.user));
    if (res.tenant) {
      localStorage.setItem('admin_tenant', JSON.stringify(res.tenant));
    }
    setToken(res.token);
    setUser(res.user);
    if (res.tenant) setTenant(res.tenant);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_tenant');
    setToken(null);
    setUser(null);
    setTenant(null);
    window.location.href = '/login';
  };

  const refreshTenant = async () => {
    if (!token) return;
    try {
      const updated = await api.getAdminTenant();
      setTenant(updated);
      localStorage.setItem('admin_tenant', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to refresh tenant info', e);
    }
  };

  useEffect(() => {
    if (token && !tenant) {
      refreshTenant();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        tenant,
        login,
        logout,
        refreshTenant,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
