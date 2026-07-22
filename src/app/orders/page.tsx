'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Search, Plus, Eye } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  processing: 'bg-primary/10 text-primary',
  ready: 'bg-success/10 text-success',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

const mockOrders = [
  { id: 'ORD-001', customer: 'Café Central', items: 12, total: 245.50, status: 'pending', date: '2026-07-22', driver: 'Miguel' },
  { id: 'ORD-002', customer: 'Restaurante O Forno', items: 8, total: 189.00, status: 'confirmed', date: '2026-07-22', driver: 'Ana' },
  { id: 'ORD-003', customer: 'Padaria Estrela', items: 24, total: 512.00, status: 'processing', date: '2026-07-22', driver: 'Miguel' },
  { id: 'ORD-004', customer: 'Hotel Lisboa', items: 5, total: 89.50, status: 'delivered', date: '2026-07-21', driver: 'Carlos' },
  { id: 'ORD-005', customer: 'Supermercado Sol', items: 36, total: 765.00, status: 'ready', date: '2026-07-21', driver: 'Ana' },
  { id: 'ORD-006', customer: 'Café Central', items: 3, total: 45.00, status: 'cancelled', date: '2026-07-20', driver: '-' },
];

const orderItems: Record<string, Array<{ name: string; qty: number; price: number }>> = {
  'ORD-001': [
    { name: 'Pão de Forma', qty: 20, price: 1.20 },
    { name: 'Croissant', qty: 30, price: 0.90 },
    { name: 'Bolo de Arroz', qty: 15, price: 1.50 },
  ],
  'ORD-002': [
    { name: 'Baguette', qty: 40, price: 0.80 },
    { name: 'Pão Integral', qty: 25, price: 1.10 },
  ],
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<typeof mockOrders[0] | null>(null);

  const filtered = mockOrders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (orderId: string, newStatus: string) => {
    if (selected?.id === orderId) {
      setSelected({ ...selected, status: newStatus });
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockOrders.length} total orders</p>
          </div>
          <button className="btn-primary text-sm">
            <Plus size={16} /> New Order
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  {mockOrders.filter(o => o.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="card-base p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <th className="table-header hidden sm:table-cell">Items</th>
                  <th className="table-header hidden md:table-cell">Total</th>
                  <th className="table-header hidden lg:table-cell">Driver</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <p className="font-mono text-sm font-semibold text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-medium text-foreground">{order.customer}</p>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="text-sm text-foreground">{order.items} items</span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="font-semibold text-foreground">R {order.total.toFixed(2)}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <span className="text-sm text-foreground">{order.driver}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelected(order)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.id}</h3>
                  <p className="text-sm text-muted-foreground">{selected.customer} · {selected.date}</p>
                </div>
                <span className={`badge-base ${statusColors[selected.status] || 'bg-muted text-muted-foreground'}`}>
                  {selected.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">Order Items</p>
                {(orderItems[selected.id] || [{ name: 'Various items', qty: selected.items, price: selected.total / selected.items }]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">R {(item.qty * item.price).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-bold text-foreground">Total</p>
                  <p className="text-lg font-bold text-primary">R {selected.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {['confirmed', 'processing', 'ready', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        selected.status === s
                          ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setSelected(null)} className="btn-primary w-full text-sm">Close</button>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
