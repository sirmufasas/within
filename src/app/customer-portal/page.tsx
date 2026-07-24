'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { ShoppingCart, Heart, User, Package, Clock, CheckCircle, XCircle, Truck, Search, MapPin, Phone, Mail, ChevronRight, ArrowLeft } from 'lucide-react';

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
  {
    id: '4',
    name: 'Hotel Bairro Alto',
    email: 'orders@bairroalto.pt',
    phone: '+351 21 555 0008',
    address: 'Rua do Alecrim 12, Lisboa',
    joinedDate: '2024-09-05',
    totalOrders: 120,
    totalSpent: 9800,
    status: 'active',
    orders: [
      { id: 'ORD-030', date: '2026-07-22', items: 15, total: 620.00, status: 'processing' },
      { id: 'ORD-031', date: '2026-07-21', items: 10, total: 410.00, status: 'delivered' },
    ],
    savedItems: [
      { id: 'p10', name: 'Croissant', price: 1.50, unit: 'unit' },
      { id: 'p11', name: 'Bolo de Arroz', price: 1.50, unit: 'unit' },
      { id: 'p12', name: 'Pão de Forma', price: 1.20, unit: 'loaf' },
    ],
  },
];

type Customer = typeof mockPortalCustomers[0];
type TabType = 'orders' | 'saved' | 'account';

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ElementType }> = {
  processing: { label: 'Processing', bgColor: 'bg-amber-100', textColor: 'text-amber-800', icon: Clock },
  out_for_delivery: { label: 'Out for Delivery', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: Truck },
  delivered: { label: 'Delivered', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: XCircle },
};

export default function CustomerPortalPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  const filtered = mockPortalCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalOrders = mockPortalCustomers.reduce((s, c) => s + c.totalOrders, 0);
  const totalRevenue = mockPortalCustomers.reduce((s, c) => s + c.totalSpent, 0);

  if (selectedCustomer) {
    return (
      <BusinessLayout>
        <div className="space-y-6">
          {/* Back Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] transition-colors"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2a1810]">{selectedCustomer.name}</h1>
              <p className="text-xs text-[#8b6f4e]">Customer Portal</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Orders', value: selectedCustomer.totalOrders.toString() },
              { label: 'Total Spent', value: `R ${selectedCustomer.totalSpent.toLocaleString()}` },
              { label: 'Saved Items', value: selectedCustomer.savedItems.length.toString() },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8dcc8] p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-[#8b6f4e] font-semibold">{s.label}</div>
                <div className="text-xl font-bold mt-1 text-[#2a1810]">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-[#e8dcc8] rounded-xl p-1 w-fit flex-wrap">
            {([
              { key: 'orders', label: 'Orders', icon: ShoppingCart },
              { key: 'saved', label: 'Saved Items', icon: Heart },
              { key: 'account', label: 'Account', icon: User },
            ] as { key: TabType; label: string; icon: React.ElementType }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#c8362b] text-white'
                    : 'text-[#6b5544] hover:bg-[#fdf8f1]'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8dcc8]">
                <h3 className="font-bold text-[#2a1810]">Order History</h3>
              </div>
              <div className="divide-y divide-[#e8dcc8]">
                {selectedCustomer.orders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.processing;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#fdf8f1] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center flex-shrink-0">
                          <Package size={18} className="text-[#c8362b]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#2a1810] text-sm">{order.id}</p>
                          <p className="text-xs text-[#8b6f4e]">{order.date} · {order.items} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.textColor}`}>
                          <StatusIcon size={11} />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </span>
                        <p className="text-sm font-bold text-[#2a1810]">R {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Items Tab */}
          {activeTab === 'saved' && (
            <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8dcc8]">
                <h3 className="font-bold text-[#2a1810]">Saved / Favourite Items</h3>
              </div>
              <div className="divide-y divide-[#e8dcc8]">
                {selectedCustomer.savedItems.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#fdf8f1] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Heart size={18} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2a1810] text-sm">{item.name}</p>
                        <p className="text-xs text-[#8b6f4e]">per {item.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-[#2a1810]">R {item.price.toFixed(2)}</p>
                      <button className="px-3 py-1.5 rounded-lg bg-[#c8362b] hover:bg-[#a82a22] text-white text-xs font-semibold transition-colors">
                        Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-[#2a1810]">Contact Details</h3>
                <div className="space-y-3">
                  {[
                    { icon: User, label: 'Name', value: selectedCustomer.name },
                    { icon: Mail, label: 'Email', value: selectedCustomer.email },
                    { icon: Phone, label: 'Phone', value: selectedCustomer.phone },
                    { icon: MapPin, label: 'Address', value: selectedCustomer.address },
                  ].map((field, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <field.icon size={14} className="text-[#8b6f4e]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#8b6f4e]">{field.label}</p>
                        <p className="text-sm font-semibold text-[#2a1810]">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-[#2a1810]">Account Summary</h3>
                <div className="space-y-1">
                  {[
                    { label: 'Member Since', value: selectedCustomer.joinedDate },
                    { label: 'Account Status', value: selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1) },
                    { label: 'Total Orders', value: selectedCustomer.totalOrders.toString() },
                    { label: 'Lifetime Value', value: `R ${selectedCustomer.totalSpent.toLocaleString()}` },
                    { label: 'Avg Order Value', value: `R ${(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)}` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#e8dcc8] last:border-0">
                      <p className="text-sm text-[#8b6f4e]">{row.label}</p>
                      <p className="text-sm font-bold text-[#2a1810]">{row.value}</p>
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2a1810]">Customer Portal</h1>
            <p className="text-sm text-[#8b6f4e] mt-0.5">View customer orders, saved items, and account details</p>
          </div>
        </div>

        {/* Stats Row */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Customers', value: mockPortalCustomers.length.toString() },
            { label: 'Active', value: mockPortalCustomers.filter(c => c.status === 'active').length.toString() },
            { label: 'Total Orders', value: totalOrders.toString() },
            { label: 'Total Revenue', value: `R ${totalRevenue.toLocaleString()}` },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8dcc8] p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-[#8b6f4e] font-semibold">{s.label}</div>
              <div className="text-xl font-bold mt-1 text-[#2a1810]">{s.value}</div>
            </div>
          ))}
        </section>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f4e]" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 pl-9 text-sm text-[#2a1810] placeholder:text-[#8b6f4e] focus:outline-none focus:border-[#c8362b] transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => { setSelectedCustomer(customer); setActiveTab('orders'); }}
              className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm p-5 text-left hover:shadow-md hover:border-[#c8362b]/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c8362b] to-[#8b1e1e] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {customer.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#2a1810] text-sm">{customer.name}</p>
                    <p className="text-xs text-[#8b6f4e]">{customer.email}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#8b6f4e] group-hover:text-[#c8362b] transition-colors mt-1 flex-shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#e8dcc8]">
                <div className="text-center">
                  <p className="text-xs text-[#8b6f4e] mb-0.5">Orders</p>
                  <p className="text-sm font-bold text-[#2a1810]">{customer.totalOrders}</p>
                </div>
                <div className="text-center border-x border-[#e8dcc8]">
                  <p className="text-xs text-[#8b6f4e] mb-0.5">Spent</p>
                  <p className="text-sm font-bold text-[#c8362b]">R {(customer.totalSpent / 1000).toFixed(1)}k</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#8b6f4e] mb-0.5">Saved</p>
                  <p className="text-sm font-bold text-[#2a1810]">{customer.savedItems.length}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center text-xl mb-3">🔍</div>
            <p className="font-bold text-[#2a1810]">No customers found</p>
            <p className="text-xs text-[#8b6f4e] mt-1">Try a different search term.</p>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
