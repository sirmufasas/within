'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { ShoppingCart, Heart, User, Package, Clock, CheckCircle, XCircle, Truck, Search, MapPin, Phone, Mail, ChevronRight, ArrowLeft,  } from 'lucide-react';

const mockPortalCustomers = [
  {
    id: '1',
    name: 'Café Central',
    email: 'central@cafe.pt',
    phone: '+351 21 555 0001',
    address: 'Rua Augusta 45, Lisboa',
    joinedDate: '2025-03-12',
    totalOrders: 42,
    totalSpent: 3240,
    status: 'active',
    orders: [
      { id: 'ORD-001', date: '2026-07-20', items: 3, total: 124.50, status: 'delivered' },
      { id: 'ORD-002', date: '2026-07-18', items: 5, total: 210.00, status: 'delivered' },
      { id: 'ORD-003', date: '2026-07-15', items: 2, total: 88.00, status: 'delivered' },
      { id: 'ORD-004', date: '2026-07-22', items: 4, total: 156.00, status: 'processing' },
    ],
    savedItems: [
      { id: 'p1', name: 'Pão de Forma', price: 1.20, unit: 'loaf' },
      { id: 'p2', name: 'Croissant', price: 1.50, unit: 'unit' },
      { id: 'p3', name: 'Baguette', price: 0.80, unit: 'unit' },
    ],
  },
  {
    id: '2',
    name: 'Padaria Estrela',
    email: 'estrela@padaria.pt',
    phone: '+351 21 555 0003',
    address: 'Av. da Liberdade 120, Lisboa',
    joinedDate: '2025-01-08',
    totalOrders: 65,
    totalSpent: 5120,
    status: 'active',
    orders: [
      { id: 'ORD-010', date: '2026-07-21', items: 8, total: 320.00, status: 'out_for_delivery' },
      { id: 'ORD-011', date: '2026-07-19', items: 6, total: 245.00, status: 'delivered' },
      { id: 'ORD-012', date: '2026-07-16', items: 4, total: 180.00, status: 'delivered' },
    ],
    savedItems: [
      { id: 'p4', name: 'Farinha T65', price: 1.80, unit: 'kg' },
      { id: 'p5', name: 'Bolo de Arroz', price: 1.50, unit: 'unit' },
    ],
  },
  {
    id: '3',
    name: 'Supermercado Sol',
    email: 'sol@super.pt',
    phone: '+351 21 555 0005',
    address: 'Praça do Comércio 8, Lisboa',
    joinedDate: '2024-11-20',
    totalOrders: 88,
    totalSpent: 7650,
    status: 'active',
    orders: [
      { id: 'ORD-020', date: '2026-07-22', items: 12, total: 480.00, status: 'processing' },
      { id: 'ORD-021', date: '2026-07-20', items: 9, total: 360.00, status: 'delivered' },
    ],
    savedItems: [
      { id: 'p6', name: 'Pão de Forma', price: 1.20, unit: 'loaf' },
      { id: 'p7', name: 'Croissant', price: 1.50, unit: 'unit' },
      { id: 'p8', name: 'Baguette', price: 0.80, unit: 'unit' },
      { id: 'p9', name: 'Farinha T65', price: 1.80, unit: 'kg' },
    ],
  },
];

type Customer = typeof mockPortalCustomers[0];
type TabType = 'orders' | 'saved' | 'account';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  processing: { label: 'Processing', color: 'bg-warning/10 text-warning', icon: Clock },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger', icon: XCircle },
};

export default function CustomerPortalPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  const filtered = mockPortalCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedCustomer) {
    return (
      <BusinessLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedCustomer.name}</h1>
              <p className="text-sm text-muted-foreground">Customer Portal</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{selectedCustomer.totalOrders}</p>
            </div>
            <div className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">R {selectedCustomer.totalSpent.toLocaleString()}</p>
            </div>
            <div className="card-base p-4 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Saved Items</p>
              <p className="text-2xl font-bold text-foreground">{selectedCustomer.savedItems.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
            {([
              { key: 'orders', label: 'Orders', icon: ShoppingCart },
              { key: 'saved', label: 'Saved Items', icon: Heart },
              { key: 'account', label: 'Account', icon: User },
            ] as { key: TabType; label: string; icon: React.ElementType }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                  activeTab === tab.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="card-base overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Order History</h3>
              </div>
              <div className="divide-y divide-border">
                {selectedCustomer.orders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.processing;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={order.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package size={18} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date} · {order.items} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`badge-base text-xs flex items-center gap-1 ${cfg.color}`}>
                          <StatusIcon size={11} />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </span>
                        <p className="text-sm font-semibold text-foreground">R {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Items Tab */}
          {activeTab === 'saved' && (
            <div className="card-base overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Saved / Favourite Items</h3>
              </div>
              <div className="divide-y divide-border">
                {selectedCustomer.savedItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                        <Heart size={18} className="text-danger" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">per {item.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">R {item.price.toFixed(2)}</p>
                      <button className="btn-primary text-xs px-3 py-1.5">Order</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-base p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Contact Details</h3>
                <div className="space-y-3">
                  {[
                    { icon: User, label: 'Name', value: selectedCustomer.name },
                    { icon: Mail, label: 'Email', value: selectedCustomer.email },
                    { icon: Phone, label: 'Phone', value: selectedCustomer.phone },
                    { icon: MapPin, label: 'Address', value: selectedCustomer.address },
                  ].map((field, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <field.icon size={15} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="text-sm font-medium text-foreground">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-base p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Account Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Member Since', value: selectedCustomer.joinedDate },
                    { label: 'Account Status', value: selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1) },
                    { label: 'Total Orders', value: selectedCustomer.totalOrders.toString() },
                    { label: 'Lifetime Value', value: `R ${selectedCustomer.totalSpent.toLocaleString()}` },
                    { label: 'Avg Order Value', value: `R ${(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)}` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <p className="text-sm text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-semibold text-foreground">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Portal</h1>
            <p className="text-sm text-muted-foreground mt-0.5">View customer orders, saved items, and account details</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: mockPortalCustomers.length.toString(), color: 'text-primary' },
            { label: 'Active', value: mockPortalCustomers.filter(c => c.status === 'active').length.toString(), color: 'text-success' },
            { label: 'Total Orders', value: mockPortalCustomers.reduce((s, c) => s + c.totalOrders, 0).toString(), color: 'text-foreground' },
            { label: 'Total Revenue', value: `R ${mockPortalCustomers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}`, color: 'text-foreground' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card-base p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => { setSelectedCustomer(customer); setActiveTab('orders'); }}
              className="card-base p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl within-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {customer.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Orders</p>
                  <p className="text-sm font-bold text-foreground">{customer.totalOrders}</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">Spent</p>
                  <p className="text-sm font-bold text-primary">R {(customer.totalSpent / 1000).toFixed(1)}k</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Saved</p>
                  <p className="text-sm font-bold text-foreground">{customer.savedItems.length}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </BusinessLayout>
  );
}
