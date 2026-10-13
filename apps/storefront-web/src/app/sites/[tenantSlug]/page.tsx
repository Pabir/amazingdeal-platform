import React from 'react';
import Link from 'next/link';
import { getTenant, getCategories, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Sparkles, SlidersHorizontal, Search } from 'lucide-react';

interface StorefrontPageProps {
  params: { tenantSlug: string };
  searchParams: { category?: string; search?: string; featured?: string };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: StorefrontPageProps) {
  const { tenantSlug } = params;
  const categoryId = searchParams.category;
  const searchQuery = searchParams.search;
  const isFeatured = searchParams.featured === 'true';

  const [tenant, categories, productsResponse] = await Promise.all([
    getTenant(tenantSlug),
    getCategories(tenantSlug),
    getProducts(tenantSlug, {
      categoryId,
      search: searchQuery,
      featured: isFeatured ? true : undefined,
    }),
  ]);

  const products = productsResponse.content || [];
  const { branding } = tenant;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Direct from {branding.storeName} Local Inventory</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            {branding.bannerHeadline || `Welcome to ${branding.storeName}`}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {branding.bannerSubheadline ||
              'Explore our curated catalogue of top-tier products, available for immediate local delivery.'}
          </p>

          {/* Search Bar Form */}
          <div className="pt-4 max-w-xl mx-auto">
            <form method="GET" action="/" className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery || ''}
                placeholder="Search products by title, SKU, or keywords..."
                className="w-full pl-12 pr-28 py-3.5 bg-white/10 text-white placeholder-slate-400 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-md text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Pills & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                !categoryId && !isFeatured
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Products
            </Link>

            <Link
              href="/?featured=true"
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isFeatured
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ★ Featured
            </Link>

            {categories.map((cat) => {
              const active = categoryId === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.id}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
            Showing <span className="text-slate-900 font-bold">{products.length}</span> products
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 p-8 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No products found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try resetting the category or search query.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 transition"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} tenant={tenant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
