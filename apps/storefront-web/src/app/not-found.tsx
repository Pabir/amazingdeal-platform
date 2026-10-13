import React from 'react';
import Link from 'next/link';
import { Store, ArrowRight, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Store Not Found</h1>
          <p className="text-sm text-slate-400">
            The requested white-label storefront could not be located. You can visit one of our active demo stores below:
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/?store=footwear"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                👟
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Stride Footwear</div>
                <div className="text-xs text-slate-400">footwear.amazingdeal.store</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
          </Link>

          <Link
            href="/?store=threads"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                👕
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Urban Threads</div>
                <div className="text-xs text-slate-400">threads.amazingdeal.store</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/?store=footwear"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Go to Default Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
