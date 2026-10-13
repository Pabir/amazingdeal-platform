'use client';

import React, { useState } from 'react';
import { ProductDto, ProductVariantDto } from '@amazingdeal/shared-types';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react';

interface AddToCartButtonProps {
  tenantSlug: string;
  product: ProductDto;
}

export function AddToCartButton({ tenantSlug, product }: AddToCartButtonProps) {
  const { addItem, isLoading } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const availableStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  const handleAdd = async () => {
    try {
      await addItem(tenantSlug, product.id, selectedVariant?.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-100">
      {/* Variant Selector */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Select Option / Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  {v.title}
                  {v.stockQuantity <= 0 && ' (Out of stock)'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & CTA */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-xs">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
            disabled={quantity >= availableStock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={availableStock <= 0 || isLoading}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-brand-600 transition shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {added ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
