'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { TenantDto, CategoryDto } from '@amazingdeal/shared-types';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, Search, Sparkles, Store } from 'lucide-react';

interface StoreHeaderProps {
  tenant: TenantDto;
  categories: CategoryDto[];
}

export function StoreHeader({ tenant, categories }: StoreHeaderProps) {
  const { cart, setOpen, loadCart } = useCartStore();

  useEffect(() => {
    loadCart(tenant.slug);
  }, [tenant.slug, loadCart]);

  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top micro announcement banner */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>
          Free delivery on all orders over {tenant.branding.currencySymbol}
          {tenant.settings?.freeShippingThreshold || 1000}!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Store Title */}
          <Link href={`/`} className="flex items-center gap-3 group">
            {tenant.branding.logoUrl ? (
              <img
                src={tenant.branding.logoUrl}
                alt={tenant.branding.storeName}
                className="w-10 h-10 object-cover rounded-xl shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {tenant.branding.storeName.substring(0, 1)}
              </div>
            )}
            <div>
              <span className="font-extrabold text-lg text-slate-900 group-hover:text-brand-600 transition tracking-tight">
                {tenant.branding.storeName}
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Official Store
              </span>
            </div>
          </Link>

          {/* Navigation Categories */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition"
            >
              All Products
            </Link>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions: Demo switcher & Cart Button */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-100 py-1 px-2.5 rounded-lg">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Store:</span>
              <Link
                href="/?store=footwear"
                className={`font-semibold ml-1 hover:underline ${
                  tenant.slug === 'footwear' ? 'text-brand-600' : 'text-slate-600'
                }`}
              >
                Footwear
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/?store=threads"
                className={`font-semibold hover:underline ${
                  tenant.slug === 'threads' ? 'text-brand-600' : 'text-slate-600'
                }`}
              >
                Threads
              </Link>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-2"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold text-slate-900">
                {tenant.branding.currencySymbol}
                {cart?.total ? cart.total.toLocaleString() : '0'}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
