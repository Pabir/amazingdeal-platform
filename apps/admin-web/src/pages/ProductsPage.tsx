import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Loader2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CreateProductRequest, ProductDto, UpdateProductRequest } from '@amazingdeal/shared-types';

interface VariantFormItem {
  sku: string;
  title: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  options: string;
}

export function ProductsPage() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const symbol = tenant?.branding?.currencySymbol || '₹';

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState('');

  // Main Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    stockQuantity: '10',
    categoryId: '',
    shortDescription: '',
    description: '',
    tags: '',
    featured: false,
    active: true,
  });

  const [imagesList, setImagesList] = useState<string[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantFormItem[]>([]);

  // Category quick-create state
  const [showCategoryQuickCreate, setShowCategoryQuickCreate] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Queries
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.getAdminProducts(0, 100),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: api.getAdminCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newProduct: CreateProductRequest) => api.createAdminProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to save product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      api.updateAdminProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const quickCategoryMutation = useMutation({
    mutationFn: (name: string) =>
      api.createAdminCategory({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        displayOrder: categories.length + 1,
      }),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setFormData((prev) => ({ ...prev, categoryId: newCat.id }));
      setNewCatName('');
      setShowCategoryQuickCreate(false);
    },
  });

  const resetForm = () => {
    setEditingProduct(null);
    setFormError(null);
    setExternalImageUrl('');
    setImagesList([]);
    setHasVariants(false);
    setVariants([]);
    setFormData({
      title: '',
      slug: '',
      sku: '',
      price: '',
      compareAtPrice: '',
      costPrice: '',
      stockQuantity: '10',
      categoryId: '',
      shortDescription: '',
      description: '',
      tags: '',
      featured: false,
      active: true,
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: ProductDto) => {
    setEditingProduct(p);
    setFormError(null);

    // Extract images
    let imgs: string[] = [];
    if (Array.isArray(p.images)) {
      imgs = p.images;
    } else if (typeof p.images === 'string' && p.images.trim()) {
      if (p.images.startsWith('[')) {
        try {
          imgs = JSON.parse(p.images);
        } catch {
          imgs = [p.images];
        }
      } else {
        imgs = [p.images];
      }
    }
    setImagesList(imgs);

    // Extract variants
    if (p.variants && p.variants.length > 0) {
      setHasVariants(true);
      setVariants(
        p.variants.map((v) => ({
          sku: v.sku,
          title: v.title,
          price: v.price.toString(),
          compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : '',
          stockQuantity: v.stockQuantity.toString(),
          options: typeof v.options === 'string' ? v.options : JSON.stringify(v.options || {}),
        }))
      );
    } else {
      setHasVariants(false);
      setVariants([]);
    }

    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      sku: p.sku || '',
      price: p.price ? p.price.toString() : '',
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : '',
      costPrice: p.costPrice ? p.costPrice.toString() : '',
      stockQuantity: p.stockQuantity ? p.stockQuantity.toString() : '0',
      categoryId: p.categoryId || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      tags: typeof p.tags === 'string' ? p.tags.replace(/[\[\]"]/g, '') : '',
      featured: !!p.featured,
      active: !!p.active,
    });

    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingProduct && (prev.slug === '' || prev.slug === autoSlug.slice(0, -1)) ? autoSlug : prev.slug,
    }));
  };

  const handleAutoGenerateSku = () => {
    const prefix = formData.title
      ? formData.title
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 4)
      : 'ITEM';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setFormError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await api.uploadMedia(files[i]);
        setImagesList((prev) => [...prev, url]);
      }
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddExternalImage = () => {
    if (!externalImageUrl.trim()) return;
    setImagesList((prev) => [...prev, externalImageUrl.trim()]);
    setExternalImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Variant Helpers
  const handleAddVariant = () => {
    const vIndex = variants.length + 1;
    const baseSku = formData.sku || 'SKU';
    setVariants((prev) => [
      ...prev,
      {
        sku: `${baseSku}-V${vIndex}`,
        title: `Option ${vIndex}`,
        price: formData.price || '0',
        compareAtPrice: formData.compareAtPrice || '',
        stockQuantity: '10',
        options: '{}',
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantFormItem, val: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Submit Handler
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Retail price must be a valid non-negative number');
      return;
    }

    const compiledVariants = hasVariants
      ? variants.map((v) => ({
          sku: v.sku.trim(),
          title: v.title.trim(),
          price: parseFloat(v.price) || parsedPrice,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
          stockQuantity: parseInt(v.stockQuantity) || 0,
          options: v.options.startsWith('{') ? v.options : JSON.stringify({ name: v.options }),
        }))
      : [];

    const payload = {
      title: formData.title.trim(),
      slug: (formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim(),
      sku: formData.sku.trim(),
      price: parsedPrice,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      stockQuantity: hasVariants && compiledVariants.length > 0
        ? compiledVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
        : parseInt(formData.stockQuantity) || 0,
      categoryId: formData.categoryId ? formData.categoryId : undefined,
      images: imagesList,
      shortDescription: formData.shortDescription.trim() || undefined,
      description: formData.description.trim() || formData.title.trim(),
      featured: formData.featured,
      active: formData.active,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      variants: compiledVariants.length > 0 ? (compiledVariants as any) : undefined,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload as any });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  // Filtered Products
  const products = productsData?.content || [];
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === 'ALL' || p.categoryId === selectedCategoryFilter;

    let matchesStock = true;
    if (stockFilter === 'IN_STOCK') matchesStock = p.stockQuantity > 5;
    else if (stockFilter === 'LOW_STOCK') matchesStock = p.stockQuantity > 0 && p.stockQuantity <= 5;
    else if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.stockQuantity === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products & Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your item catalogue, real-time stock levels, variants, and storefront pricing
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm text-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, SKU, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt; 5)</option>
              <option value="LOW_STOCK">Low Stock (1 - 5)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-semibold ml-auto">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-hover">
            <thead className="bg-slate-50/70 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No products matching your search criteria.{' '}
                    <button
                      onClick={handleOpenAddModal}
                      className="text-blue-600 font-bold hover:underline ml-1"
                    >
                      Click here to add one.
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  let img = '';
                  try {
                    if (Array.isArray(p.images)) {
                      img = p.images[0] || '';
                    } else if (typeof p.images === 'string' && p.images.trim()) {
                      if (p.images.startsWith('[')) {
                        img = JSON.parse(p.images)[0] || '';
                      } else {
                        img = p.images;
                      }
                    }
                  } catch {}

                  const categoryObj = categories.find((c) => c.id === p.categoryId);
                  const categoryName = p.categoryName || categoryObj?.name || 'Uncategorized';
                  const storefrontUrl = tenant?.slug
                    ? `http://localhost:3000/?store=${tenant.slug}&product=${p.slug}`
                    : `http://localhost:3000`;

                  return (
                    <tr key={p.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative group">
                            {img ? (
                              <img src={img} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 m-3 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs line-clamp-1">{p.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{p.slug}</span>
                            {p.variants && p.variants.length > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600">
                                {p.variants.length} Variants
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {categoryName}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-600 font-semibold">{p.sku}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {symbol}{p.price.toLocaleString()}
                          </span>
                          {p.compareAtPrice && p.compareAtPrice > p.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {symbol}{p.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {p.stockQuantity === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                            Out of Stock
                          </span>
                        ) : p.stockQuantity <= 5 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                            Low: {p.stockQuantity} left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {p.stockQuantity} in stock
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.active ? 'Active' : 'Draft'}
                        </span>
                        {p.featured && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                            ★ Featured
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={storefrontUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.title}? This cannot be undone.`)) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingProduct
                    ? 'Modify product specifications, pricing, stock, and variations'
                    : 'Publish an item to your store catalogue and inventory'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notification */}
            {formError && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 font-semibold">{formError}</div>
                <button onClick={() => setFormError(null)} className="text-rose-500 hover:text-rose-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitProduct} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  1. Product Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Classic Oxford Leather Shoes"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="classic-oxford-leather-shoes"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">SKU (Stock Keeping Unit) *</label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateSku}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto Gen</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="OXF-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Category</label>
                      <button
                        type="button"
                        onClick={() => setShowCategoryQuickCreate(!showCategoryQuickCreate)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        {showCategoryQuickCreate ? 'Cancel' : '+ Quick Add Category'}
                      </button>
                    </div>

                    {showCategoryQuickCreate && (
                      <div className="mb-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="New category name (e.g. Boots)"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          disabled={!newCatName.trim() || quickCategoryMutation.isPending}
                          onClick={() => quickCategoryMutation.mutate(newCatName.trim())}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                          {quickCategoryMutation.isPending ? 'Saving...' : 'Create'}
                        </button>
                      </div>
                    )}

                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800"
                    >
                      <option value="">No Category Selected</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Short Description (Teaser for catalog listings)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Handcrafted full-grain leather oxford with cushioned memory foam insole"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Description & Features
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed product story, materials, dimensions, and care instructions..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  2. Pricing & Base Inventory
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Retail Price ({symbol}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="2999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Compare at Price ({symbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="3999"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cost Price ({symbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1200"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      disabled={hasVariants && variants.length > 0}
                      placeholder="25"
                      value={
                        hasVariants && variants.length > 0
                          ? variants.reduce((acc, v) => acc + (parseInt(v.stockQuantity) || 0), 0)
                          : formData.stockQuantity
                      }
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50"
                    />
                    {hasVariants && variants.length > 0 && (
                      <span className="text-[10px] text-slate-400 mt-1 block">Summed from variants</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Media & Images */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  3. Media & Product Photography
                </h4>

                {/* Upload or paste URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading file to cloud storage...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <UploadCloud className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold text-slate-700">Upload Image Files</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WebP up to 10MB</span>
                      </div>
                    )}
                  </label>

                  <div className="flex flex-col justify-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-200/80">
                    <label className="text-xs font-bold text-slate-700">Add External Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={externalImageUrl}
                        onChange={(e) => setExternalImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddExternalImage}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Thumbnails Gallery */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                    {imagesList.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl border border-slate-200 bg-slate-100 overflow-hidden aspect-square"
                      >
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Variants Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      4. Variants (Sizes, Colors, Fits)
                    </h4>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        if (e.target.checked && variants.length === 0) {
                          handleAddVariant();
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>This product has multiple options</span>
                  </label>
                </div>

                {hasVariants && (
                  <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Specify individual SKUs, pricing, and stock for each size or color combination.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"
                        >
                          <div className="col-span-4">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Option / Size</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. UK 8 / Black"
                              value={v.title}
                              onChange={(e) => handleVariantChange(idx, 'title', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">SKU</label>
                            <input
                              type="text"
                              required
                              placeholder="SKU-VAR"
                              value={v.sku}
                              onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                              className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Price ({symbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={v.price}
                              onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Stock</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={v.stockQuantity}
                              onChange={(e) => handleVariantChange(idx, 'stockQuantity', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="col-span-1 text-right pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Visibility and Tags */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  5. Storefront Visibility
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Running, Marathon, Carbon Plate, New Arrival"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Featured on Home Page Carousel</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active & Visible to Buyers</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>
                    {editingProduct
                      ? updateMutation.isPending
                        ? 'Updating...'
                        : 'Update Product'
                      : createMutation.isPending
                      ? 'Saving to Database...'
                      : 'Save & Publish Product'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
