import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle2, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, tenant, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-slate-800">
          {tenant?.branding?.storeName || 'Merchant Admin Console'}
        </h2>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tenant Isolated</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <UserCircle2 className="w-8 h-8 text-slate-400" />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.fullName || 'Store Merchant'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {user?.email || 'admin@store.com'}
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Sign out of console"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
