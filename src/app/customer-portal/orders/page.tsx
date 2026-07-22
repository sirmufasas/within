'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Truck, Search, Filter, ArrowLeft, Eye, ShoppingCart, Plus, Calendar, MapPin, User,  } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  processing: { label: 'Processing', color: 'bg-warning/10 text-warning', icon: Clock },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger', icon: XCircle },
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
};

const mockAllOrders = [
  { id: 'ORD-001', customer: 'Café Central', date: '2026-07-20', items: 3, total: 124.50, status: 'delivered', address: 'Rua Augusta 45, Lisboa' },
  { id: 'ORD-002', customer: 'Café Central', date: '2026-07-18', items: 5, total: 210.00, status: 'delivered', address: 'Rua Augusta 45, Lisboa' },
  { id: 'ORD-003', customer: 'Padaria Estrela', date: '2026-07-21', items: 8, total: 320.00, status: 'out_for_delivery', address: 'Av. da Liberdade 120, Lisboa' },
  { id: 'ORD-004', customer: 'Café Central', date: '2026-07-22', items: 4, total: 156.00, status: 'processing', address: 'Rua Augusta 45, Lisboa' },
  { id: 'ORD-005', customer: 'Supermercado Sol', date: '2026-07-22', items: 12, total: 480.00, status: 'processing', address: 'Praça do Comércio 8, Lisboa' },
  { id: 'ORD-006', customer: 'Padaria Estrela', date: '2026-07-19', items: 6, total: 245.00, status: 'delivered', address: 'Av. da Liberdade 120, Lisboa' },
  { id: 'ORD-007', customer: 'Supermercado Sol', date: '2026-07-20', items: 9, total: 360.00, status: 'delivered', address: 'Praça do Comércio 8, Lisboa' },
  { id: 'ORD-008', customer: 'Café Central', date: '2026-07-15', items: 2, total: 88.00, status: 'delivered', address: 'Rua Augusta 45, Lisboa' },
];

const orderItems: Record<string, { name: string; qty: number; price: number; unit: string }[]> = {
  'ORD-001': [
    { name: 'Pão de Forma', qty: 10, price: 1.20, unit: 'loaf' },
    { name: 'Croissant', qty: 20, price: 1.50, unit: 'unit' },
    { name: 'Baguette', qty: 15, price: 0.80, unit: 'unit' },
  ],
  'ORD-004': [
    { name: 'Croissant', qty: 30, price: 1.50, unit: 'unit' },
    { name: 'Pão de Forma', qty: 5, price: 1.20, unit: 'loaf' },
    { name: 'Bolo de Arroz', qty: 20, price: 1.50, unit: 'unit' },
    { name: 'Baguette', qty: 25, price: 0.80, unit: 'unit' },
  ],
};

export default function CustomerPortalOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockAllOrders[0] | null>(null);

  const filtered = mockAllOrders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: mockAllOrders.length,
    processing: mockAllOrders.filter(o => o.status === 'processing').length,
    delivering: mockAllOrders.filter(o => o.status === 'out_for_delivery').length,
    delivered: mockAllOrders.filter(o => o.status === 'delivered').length,
  };

  if (selectedOrder) {
    const cfg = statusConfig[selectedOrder.status] || statusConfig.processing;
    const StatusIcon = cfg.icon;
    const items = orderItems[selectedOrder.id] || [
      { name: 'Mixed Items', qty: selectedOrder.items, price: selectedOrder.total / selectedOrder.items, unit: 'unit' },
    ];

    return (
      <BusinessLayout>
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order {selectedOrder.id}</h1>
              <p className="text-sm text-muted-foreground">Customer Portal → Orders</p>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`card-base p-5 border-l-4 ${selectedOrder.status === 'delivered' ? 'border-l-success' : selectedOrder.status === 'processing' ? 'border-l-warning' : 'border-l-primary'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color.replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}>
                  <StatusIcon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground">Placed on {selectedOrder.date}</p>
                </div>
              </div>
              <span className={`badge-base text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-base p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Order Info</h3>
              {[
                { icon: Package, label: 'Order ID', value: selectedOrder.id },
                { icon: Calendar, label: 'Date', value: selectedOrder.date },
                { icon: User, label: 'Customer', value: selectedOrder.customer },
                { icon: MapPin, label: 'Delivery Address', value: selectedOrder.address },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <row.icon size={13} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="text-sm font-medium text-foreground">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.name} × {item.qty}</span>
                    <span className="font-medium text-foreground">R {(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-lg">R {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/order-tracking" className="btn-primary text-sm flex items-center gap-2">
              <Truck size={15} /> Track Delivery
            </Link>
            <button onClick={() => setSelectedOrder(null)} className="btn-secondary text-sm">
              Back to Orders
            </button>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/customer-portal" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customer Orders</h1>
              <p className="text-sm text-muted-foreground mt-0.5">All orders across your customer portal</p>
            </div>
          </div>
          <Link href="/orders" className="btn-primary text-sm flex items-center gap-2 self-start sm:self-auto">
            <Plus size={15} /> New Order
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-foreground', bg: 'bg-muted/30' },
            { label: 'Processing', value: stats.processing, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Out for Delivery', value: stats.delivering, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Delivered', value: stats.delivered, color: 'text-success', bg: 'bg-success/10' },
          ].map((s, i) => (
            <div key={i} className={`card-base p-4 ${s.bg}`}>
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              className="input-field pl-9 pr-8 w-full sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Order</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header hidden sm:table-cell">Date</th>
                  <th className="table-header hidden md:table-cell">Items</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.processing;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <span className="font-mono text-sm font-semibold text-foreground">{order.id}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 within-gradient rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {order.customer[0]}
                          </div>
                          <span className="text-sm font-medium text-foreground">{order.customer}</span>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-foreground">{order.date}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-sm text-foreground">{order.items} items</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-foreground">R {order.total.toFixed(2)}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs flex items-center gap-1 w-fit ${cfg.color}`}>
                          <StatusIcon size={11} />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <ShoppingCart size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
}
