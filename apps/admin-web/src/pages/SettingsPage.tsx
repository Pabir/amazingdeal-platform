import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Settings, Save, CheckCircle2, Shield, Palette, Store } from 'lucide-react';

export function SettingsPage() {
  const { tenant, refreshTenant } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    storeName: '',
    customDomain: '',
    primaryColor: '#2563eb',
    accentColor: '#1e40af',
    currency: 'INR',
    currencySymbol: '₹',
    contactEmail: '',
    contactPhone: '',
    address: '',
    bannerHeadline: '',
    bannerSubheadline: '',
    shippingFee: '50',
    freeShippingThreshold: '1000',
    enableCod: true,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData({
        businessName: tenant.businessName || '',
        storeName: tenant.branding.storeName || '',
        customDomain: tenant.customDomain || '',
        primaryColor: tenant.branding.primaryColor || '#2563eb',
        accentColor: tenant.branding.accentColor || '#1e40af',
        currency: tenant.branding.currency || 'INR',
        currencySymbol: tenant.branding.currencySymbol || '₹',
        contactEmail: tenant.branding.contactEmail || '',
        contactPhone: tenant.branding.contactPhone || '',
        address: tenant.branding.address || '',
        bannerHeadline: tenant.branding.bannerHeadline || '',
        bannerSubheadline: tenant.branding.bannerSubheadline || '',
        shippingFee: String(tenant.settings?.shippingFee ?? '50'),
        freeShippingThreshold: String(tenant.settings?.freeShippingThreshold ?? '1000'),
        enableCod: tenant.settings?.enableCod ?? true,
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateAdminTenant({
        businessName: formData.businessName,
        storeName: formData.storeName,
        customDomain: formData.customDomain || undefined,
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        bannerHeadline: formData.bannerHeadline,
        bannerSubheadline: formData.bannerSubheadline,
        shippingFee: parseFloat(formData.shippingFee) || 0,
        freeShippingThreshold: parseFloat(formData.freeShippingThreshold) || undefined,
        enableCod: formData.enableCod,
      });

      await refreshTenant();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Branding & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize your white-label buyer storefront experience, styling, and checkout rules
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold">Store settings successfully saved and updated!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Store Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Store Profile & Domain</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storefront Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Custom Domain (e.g. footwear.com)
              </label>
              <input
                type="text"
                placeholder="shoes.yourdomain.com"
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tenant Slug (System Identifier)
              </label>
              <input
                type="text"
                disabled
                value={tenant?.slug || ''}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Visual Branding & Colors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Visual Theme & Hero Banner</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                placeholder="Welcome to our Store"
                value={formData.bannerHeadline}
                onChange={(e) => setFormData({ ...formData, bannerHeadline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hero Subheadline
              </label>
              <textarea
                rows={2}
                placeholder="Browse our premier offline inventory online..."
                value={formData.bannerSubheadline}
                onChange={(e) => setFormData({ ...formData, bannerSubheadline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Payment Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Commerce & Shipping Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Standard Shipping Fee ({formData.currencySymbol})
              </label>
              <input
                type="number"
                value={formData.shippingFee}
                onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Free Shipping Threshold ({formData.currencySymbol})
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Store Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="enableCod"
                checked={formData.enableCod}
                onChange={(e) => setFormData({ ...formData, enableCod: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enableCod" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Enable Cash on Delivery (COD) Checkout
              </label>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
