'use client';

import { create } from 'zustand';
import { CartDto } from '@amazingdeal/shared-types';
import * as api from './api';

interface CartState {
  cart: CartDto | null;
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string;
  setOpen: (isOpen: boolean) => void;
  loadCart: (tenantSlug: string) => Promise<void>;
  addItem: (tenantSlug: string, productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (tenantSlug: string, itemId: string, quantity: number) => Promise<void>;
  removeItem: (tenantSlug: string, itemId: string) => Promise<void>;
  clearCartState: () => void;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sid = localStorage.getItem('commerce_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('commerce_session_id', sid);
  }
  return sid;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  sessionId: typeof window !== 'undefined' ? getOrCreateSessionId() : '',

  setOpen: (isOpen) => set({ isOpen }),

  loadCart: async (tenantSlug: string) => {
    try {
      set({ isLoading: true });
      const sid = get().sessionId || getOrCreateSessionId();
      const cart = await api.getCart(tenantSlug, sid);
      set({ cart, isLoading: false, sessionId: sid });
    } catch (e) {
      console.error('Failed to load cart', e);
      set({ isLoading: false });
    }
  },

  addItem: async (tenantSlug: string, productId: string, variantId?: string, quantity = 1) => {
    try {
      set({ isLoading: true });
      const sid = get().sessionId || getOrCreateSessionId();
      const cart = await api.addToCart(tenantSlug, {
        productId,
        variantId,
        quantity,
        sessionId: sid,
      });
      set({ cart, isOpen: true, isLoading: false, sessionId: sid });
    } catch (e) {
      console.error('Failed to add item to cart', e);
      set({ isLoading: false });
      throw e;
    }
  },

  updateQuantity: async (tenantSlug: string, itemId: string, quantity: number) => {
    try {
      set({ isLoading: true });
      const sid = get().sessionId;
      const cart = await api.updateCartItemQuantity(tenantSlug, itemId, quantity, sid);
      set({ cart, isLoading: false });
    } catch (e) {
      console.error('Failed to update item quantity', e);
      set({ isLoading: false });
    }
  },

  removeItem: async (tenantSlug: string, itemId: string) => {
    try {
      set({ isLoading: true });
      const sid = get().sessionId;
      const cart = await api.removeCartItem(tenantSlug, itemId, sid);
      set({ cart, isLoading: false });
    } catch (e) {
      console.error('Failed to remove item', e);
      set({ isLoading: false });
    }
  },

  clearCartState: () => {
    set({ cart: null, isOpen: false });
  },
}));
