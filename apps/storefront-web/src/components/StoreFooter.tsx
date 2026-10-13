import React from 'react';
import { TenantDto } from '@amazingdeal/shared-types';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export function StoreFooter({ tenant }: { tenant: TenantDto }) {
  const { branding } = tenant;

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      {/* Guarantees bar */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Truck className="w-6 h-6 text-brand-500" />
            <div>
              <p className="font-bold text-white text-sm">Swift Local Delivery</p>
              <p className="text-xs text-slate-400">Shipped directly from our neighborhood store</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-500" />
            <div>
              <p className="font-bold text-white text-sm">100% Authentic Guarantee</p>
              <p className="text-xs text-slate-400">Original offline merchant inventory</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <RefreshCw className="w-6 h-6 text-brand-500" />
            <div>
              <p className="font-bold text-white text-sm">Hassle-Free Returns</p>
              <p className="text-xs text-slate-400">7-day replacement policy on defects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <h3 className="text-lg font-bold text-white">{branding.storeName}</h3>
          <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
            {branding.bannerSubheadline ||
              'Quality commerce directly from trusted local retailers to your doorstep.'}
          </p>
          <p className="text-xs text-slate-500 pt-2">
            Powered by <span className="font-semibold text-slate-300">AmazingDeal Commerce Engine</span>
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
            Store Contact
          </h4>
          <ul className="space-y-2 text-xs">
            {branding.contactEmail && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{branding.contactEmail}</span>
              </li>
            )}
            {branding.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{branding.contactPhone}</span>
              </li>
            )}
            {branding.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>{branding.address}</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
            Information
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition">About Our Store</a></li>
            <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {branding.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
