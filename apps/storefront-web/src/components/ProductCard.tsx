'use client';

import React from 'react';
import Link from 'next/link';
import { ProductDto, TenantDto } from '@amazingdeal/shared-types';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: ProductDto;
  tenant: TenantDto;
}

export function ProductCard({ product, tenant }: ProductCardProps) {
  const { addItem, isLoading } = useCartStore();
  const symbol = tenant.branding.currencySymbol || '₹';

  const images = React.useMemo(() => {
    if (Array.isArray(product.images)) return product.images;
    if (typeof product.images === 'string') {
      try {
        if (product.images.startsWith('[')) {
          return JSON.parse(product.images) as string[];
        }
        return [product.images];
      } catch {
        return [product.images];
      }
    }
    return [];
  }, [product.images]);

  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(tenant.slug, product.id, undefined, 1);
  };

  const productUrl = `/products/${product.slug}${tenant?.slug ? `?store=${tenant.slug}` : ''}`;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden card-hover flex flex-col h-full shadow-xs">
      {/* Image Container */}
      <Link href={productUrl} className="relative aspect-square overflow-hidden bg-slate-100 block">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white bg-slate-900 rounded-lg shadow-sm">
              Featured
            </span>
          )}
          {discountPercent && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 rounded-lg shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            SKU: {product.sku}
          </span>
          <Link href={productUrl}>
            <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-brand-600 transition">
              {product.title}
            </h3>
          </Link>
          {product.shortDescription && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & CTA */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900">
                {symbol}{product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {symbol}{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">In stock: {product.stockQuantity}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={productUrl}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock || isLoading}
              className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-brand-600 transition shadow-sm disabled:opacity-40 disabled:hover:bg-slate-900"
              title="Quick Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
