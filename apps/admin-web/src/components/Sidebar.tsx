import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  ExternalLink,
  Store,
} from 'lucide-react';

export function Sidebar() {
  const { tenant } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/categories', label: 'Categories', icon: Layers },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/settings', label: 'Store Settings', icon: Settings },
  ];

  const storefrontUrl = tenant?.slug
    ? `http://localhost:3000/?store=${tenant.slug}`
    : 'http://localhost:3000';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          A
        </div>
        <div className="overflow-hidden">
          <span className="font-extrabold text-white text-base tracking-tight block">
            AmazingDeal
          </span>
          <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
            Merchant Console
          </span>
        </div>
      </div>

      {/* Active Store Widget */}
      <div className="p-4 mx-4 my-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center gap-2 mb-1.5">
          <Store className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white truncate">
            {tenant?.branding?.storeName || 'My Store'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono bg-slate-900/60 px-1.5 py-0.5 rounded text-slate-300">
            slug: {tenant?.slug || 'store'}
          </span>
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition"
          >
            <span>Live</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Switcher Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <p className="font-medium text-slate-400">Single Shared DB</p>
        <p className="mt-0.5 text-slate-500">Hibernate 6 Column-Isolated</p>
      </div>
    </aside>
  );
}
