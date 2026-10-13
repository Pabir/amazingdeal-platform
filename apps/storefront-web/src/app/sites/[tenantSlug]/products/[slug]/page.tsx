import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTenant, getProduct } from '@/lib/api';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ChevronRight, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';

interface ProductPageProps {
  params: {
    tenantSlug: string;
    slug: string;
  };
}

function parseImages(rawImages: unknown): string[] {
  if (Array.isArray(rawImages)) return rawImages as string[];
  if (typeof rawImages === 'string') {
    try {
      if (rawImages.startsWith('[')) {
        return JSON.parse(rawImages) as string[];
      }
      return [rawImages];
    } catch {
      return [rawImages];
    }
  }
  return [];
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const [tenant, product] = await Promise.all([
      getTenant(params.tenantSlug),
      getProduct(params.tenantSlug, params.slug),
    ]);

    const images = parseImages(product.images);
    const imageUrl = images[0] || '';

    return {
      title: `${product.title} | ${tenant.branding.storeName}`,
      description: product.shortDescription || product.description.substring(0, 160),
      openGraph: {
        title: product.title,
        description: product.shortDescription || product.description.substring(0, 160),
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    };
  } catch {
    return {
      title: 'Product Not Found',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { tenantSlug, slug } = params;

  let tenant;
  let product;

  try {
    [tenant, product] = await Promise.all([
      getTenant(tenantSlug),
      getProduct(tenantSlug, slug),
    ]);
  } catch (e) {
    notFound();
  }

  const symbol = tenant.branding.currencySymbol || '₹';

  const images = parseImages(product.images);

  const mainImage = images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800';

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs relative">
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white"
                >
                  <img
                    src={img}
                    alt={`${product.title} - ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                SKU: {product.sku}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9 (120+ reviews)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {product.shortDescription && (
              <p className="text-base text-slate-600 mt-2 font-normal leading-relaxed">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Pricing Row */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {symbol}{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-base text-slate-400 line-through">
                {symbol}{product.compareAtPrice.toLocaleString()}
              </span>
            )}
            <span
              className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                product.inStock
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {product.inStock ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
            </span>
          </div>

          {/* Add to Cart with Variant Selector */}
          <AddToCartButton tenantSlug={tenantSlug} product={product} />

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <Truck className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">Fast Delivery</p>
              <p className="text-[10px] text-slate-500">Direct from store</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">100% Genuine</p>
              <p className="text-[10px] text-slate-500">Verified inventory</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <RefreshCw className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-900">7-Day Return</p>
              <p className="text-[10px] text-slate-500">Easy replacement</p>
            </div>
          </div>

          {/* Long Description */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Product Overview & Specifications
            </h3>
            <div className="prose prose-sm text-slate-600 leading-relaxed max-w-none">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
