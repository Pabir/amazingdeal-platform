import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { OrderDto, OrderStatus } from '@amazingdeal/shared-types';
import { ShoppingBag, Eye, X, MapPin, CheckCircle, Clock } from 'lucide-react';

export function OrdersPage() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const symbol = tenant?.branding?.currencySymbol || '₹';

  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.getAdminOrders(0, 100),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateAdminOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const orders = ordersData?.content || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process buyer transactions, fulfillment lifecycles, and shipment dispatch
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
          {orders.length} Total Orders
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-hover">
            <thead className="bg-slate-50/70 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Fulfillment Status</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">
                    No orders placed yet. As customers order from your storefront, they will be listed here.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 text-xs">
                      {ord.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-xs">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                      {symbol}{ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800">{ord.paymentMethod}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          statusMutation.mutate({
                            id: ord.id,
                            status: e.target.value as OrderStatus,
                          })
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                          ord.status === 'DELIVERED'
                            ? 'text-emerald-700 bg-emerald-50/50'
                            : ord.status === 'SHIPPED'
                            ? 'text-blue-700 bg-blue-50/50'
                            : ord.status === 'CANCELLED'
                            ? 'text-rose-700 bg-rose-50/50'
                            : 'text-amber-700 bg-amber-50/50'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Customer Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer & Delivery Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Name:</span>{' '}
                    <span className="font-semibold text-slate-900">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-semibold text-slate-900">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Email:</span>{' '}
                    <span className="font-semibold text-slate-900">{selectedOrder.customerEmail}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 block mb-1">Shipping Address:</span>
                  <p className="font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap">
                    {(() => {
                      if (!selectedOrder.shippingAddress) return '—';
                      if (typeof selectedOrder.shippingAddress === 'string') {
                        try {
                          const parsed = JSON.parse(selectedOrder.shippingAddress);
                          return `${parsed.address || parsed.addressLine1 || ''}, ${parsed.city || ''}, ${parsed.state || ''} - ${parsed.postalCode || ''}`;
                        } catch {
                          return selectedOrder.shippingAddress;
                        }
                      }
                      const sa = selectedOrder.shippingAddress;
                      return `${sa.addressLine1}, ${sa.city}, ${sa.state} - ${sa.postalCode}`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between bg-white text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.productTitle}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          SKU: {item.productSku} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {symbol}{item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{symbol}{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping:</span>
                    <span>{symbol}{selectedOrder.shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span>{symbol}{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
