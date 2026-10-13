'use client';

import React, { useState } from 'react';
import { TenantDto, OrderDto } from '@amazingdeal/shared-types';
import { useCartStore } from '@/lib/cart-store';
import * as api from '@/lib/api';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard } from 'lucide-react';

interface CheckoutModalProps {
  tenant: TenantDto;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ tenant, isOpen, onClose }: CheckoutModalProps) {
  const { cart, clearCartState } = useCartStore();
  const symbol = tenant.branding.currencySymbol || '₹';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'COD' as 'COD' | 'ONLINE_RAZORPAY',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.id) return;

    setSubmitting(true);
    setError(null);

    try {
      const order = await api.createOrder(tenant.slug, {
        cartId: cart.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        }),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });

      setCreatedOrder(order);
      clearCartState();
    } catch (err: any) {
      setError(err?.message || 'Failed to place order. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {createdOrder ? 'Order Confirmation' : 'Checkout & Shipping'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {createdOrder
                ? 'Thank you for your purchase!'
                : `Complete your order from ${tenant.branding.storeName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {createdOrder ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your order number is{' '}
                <span className="font-mono font-bold text-brand-600">
                  {createdOrder.orderNumber}
                </span>
                . A confirmation has been sent to {createdOrder.customerEmail}.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl max-w-md mx-auto text-left text-sm space-y-2 border border-slate-100 mt-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Total:</span>
                  <span className="font-bold text-slate-900">
                    {symbol}{createdOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-800">{createdOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                    {createdOrder.status}
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {error}
                </div>
              )}

              {/* Order summary bar */}
              <div className="p-4 bg-brand-50/60 border border-brand-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-800 uppercase tracking-wide">
                    Cart Total ({cart?.itemCount || 0} items)
                  </span>
                  <p className="text-lg font-bold text-brand-900">
                    {symbol}{cart?.total?.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brand-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Secure 256-bit checkout</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Shipping Details
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Flat No, Street, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Zip *</label>
                    <input
                      type="text"
                      required
                      placeholder="400001"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Payment Method
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                      formData.paymentMethod === 'COD'
                        ? 'border-brand-500 bg-brand-50/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                        <p className="text-[10px] text-slate-500">Pay at your doorstep</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                      formData.paymentMethod === 'ONLINE_RAZORPAY'
                        ? 'border-brand-500 bg-brand-50/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE_RAZORPAY"
                      checked={formData.paymentMethod === 'ONLINE_RAZORPAY'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'ONLINE_RAZORPAY' })}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">UPI / Cards / NetBanking</p>
                        <p className="text-[10px] text-slate-500">Instant online payment</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <span>Confirm Order • {symbol}{cart?.total?.toLocaleString()}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
