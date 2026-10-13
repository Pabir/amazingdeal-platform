import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { tenant } = useAuth();
  const symbol = tenant?.branding?.currencySymbol || '₹';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: api.getDashboardStats,
  });

  const storefrontUrl = tenant?.slug
    ? `http://localhost:3000/?store=${tenant.slug}`
    : 'http://localhost:3000';

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {tenant?.branding?.storeName || 'Merchant'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dashboard for store{' '}
            <span className="font-mono font-semibold text-slate-800">
              {tenant?.slug}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          >
            + Add Product
          </Link>
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {symbol}
            {stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>All completed & confirmed orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Lifetime store transactions</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Orders
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.pendingOrders || 0}
          </div>
          <p className="text-[11px] text-amber-600 font-medium">Awaiting merchant confirmation</p>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Low Stock Alert
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.lowStockProducts || 0}
          </div>
          <p className="text-[11px] text-rose-600 font-medium">Items with under 5 units left</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest transactions placed across your storefront
            </p>
          </div>
          <Link
            to="/orders"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-hover">
            <thead className="bg-slate-50/70 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order Number</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">
                    No orders placed yet. Orders made via the buyer storefront will appear here.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 text-xs">
                      {ord.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-xs">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {ord.paymentMethod}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                      {symbol}{ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-700'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
