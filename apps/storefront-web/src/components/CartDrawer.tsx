'use client';

import React from 'react';
import { useCartStore } from '@/lib/cart-store';
import { TenantDto } from '@amazingdeal/shared-types';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  tenant: TenantDto;
  onOpenCheckout: () => void;
}

export function CartDrawer({ tenant, onOpenCheckout }: CartDrawerProps) {
  const { cart, isOpen, setOpen, updateQuantity, removeItem, isLoading } = useCartStore();

  if (!isOpen) return null;

  const symbol = tenant.branding.currencySymbol || '₹';
  const items = cart?.items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                {cart?.itemCount || 0} items
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <ShoppingBag className="w-16 h-16 text-slate-300 mb-4 stroke-[1.5]" />
                <p className="font-semibold text-slate-800 text-lg">Your cart is empty</p>
                <p className="text-sm text-slate-500 mt-1">Discover items and add them to your cart.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.productTitle}
                      </h4>
                      {item.variantTitle && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {symbol}{item.unitPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(tenant.slug, item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          disabled={isLoading}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(tenant.slug, item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          disabled={isLoading || item.quantity >= item.availableStock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(tenant.slug, item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-md hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{symbol}{cart?.subtotal?.toLocaleString()}</span>
                </div>
                {cart?.taxAmount && cart.taxAmount > 0 ? (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>{symbol}{cart.taxAmount.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>
                    {cart?.shippingFee && cart.shippingFee > 0
                      ? `${symbol}${cart.shippingFee.toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>{symbol}{cart?.total?.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
