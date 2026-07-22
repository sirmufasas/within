'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { Search, Plus, Filter, Phone, Mail, Eye, Edit } from 'lucide-react';

const mockCustomers = [
  { id: '1', name: 'Café Central', phone: '+351 21 555 0001', email: 'central@cafe.pt', driver: 'Miguel', orders: 42, totalSpent: 3240, status: 'active' },
  { id: '2', name: 'Restaurante O Forno', phone: '+351 21 555 0002', email: 'forno@rest.pt', driver: 'Ana', orders: 28, totalSpent: 1890, status: 'active' },
  { id: '3', name: 'Padaria Estrela', phone: '+351 21 555 0003', email: 'estrela@padaria.pt', driver: 'Miguel', orders: 65, totalSpent: 5120, status: 'active' },
  { id: '4', name: 'Hotel Lisboa', phone: '+351 21 555 0004', email: 'orders@hotel.pt', driver: 'Carlos', orders: 15, totalSpent: 890, status: 'inactive' },
  { id: '5', name: 'Supermercado Sol', phone: '+351 21 555 0005', email: 'sol@super.pt', driver: 'Ana', orders: 88, totalSpent: 7650, status: 'active' },
];

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<(typeof mockCustomers)[0] | null>(null);

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockCustomers.length} total customers</p>
          </div>
          <button className="btn-primary text-sm">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: '5', color: 'text-primary' },
            { label: 'Active', value: '4', color: 'text-success' },
            { label: 'Orders This Month', value: '238', color: 'text-foreground' },
            { label: 'Avg. Order Value', value: 'R 124', color: 'text-foreground' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card-base p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-secondary text-sm">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Customer</th>
                  <th className="table-header hidden sm:table-cell">Contact</th>
                  <th className="table-header hidden md:table-cell">Driver</th>
                  <th className="table-header">Orders</th>
                  <th className="table-header hidden lg:table-cell">Total Spent</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full within-gradient flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {customer.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={11} />{customer.phone}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={11} />{customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm text-foreground">{customer.driver}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-foreground">{customer.orders}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <span className="font-semibold text-foreground">R {formatNumber(customer.totalSpent)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base ${customer.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(customer)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Edit size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full within-gradient flex items-center justify-center text-white text-xl font-bold">
                  {selected.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                  <span className={`badge-base text-xs ${selected.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selected.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">{selected.orders}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">R {formatNumber(selected.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 text-sm">Edit Customer</button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
