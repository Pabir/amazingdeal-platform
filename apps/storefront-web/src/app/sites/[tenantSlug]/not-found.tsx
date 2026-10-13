import React from 'react';
import Link from 'next/link';
import { PackageX, ArrowLeft } from 'lucide-react';

export default function TenantProductNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
        <PackageX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The requested product could not be found in this store's catalog or may have been removed.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    </div>
  );
}
