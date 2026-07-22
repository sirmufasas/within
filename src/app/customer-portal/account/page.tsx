'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import Link from 'next/link';
import {
  User, Mail, Phone, MapPin, Building2, Search,
  ArrowLeft, Edit2, Save, X, TrendingUp, ShoppingCart,
  Calendar, CheckCircle, Plus, ChevronRight,
} from 'lucide-react';

interface PortalCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  businessType: string;
  avgOrderValue: number;
  lastOrderDate: string;
}

const mockCustomers: PortalCustomer[] = [
  {
    id: '1', name: 'Café Central', email: 'central@cafe.pt', phone: '+351 21 555 0001',
    address: 'Rua Augusta 45, Lisboa', joinedDate: '2025-03-12', totalOrders: 42,
    totalSpent: 3240, status: 'active', businessType: 'Coffee Shop',
    avgOrderValue: 77.14, lastOrderDate: '2026-07-22',
  },
  {
    id: '2', name: 'Padaria Estrela', email: 'estrela@padaria.pt', phone: '+351 21 555 0003',
    address: 'Av. da Liberdade 120, Lisboa', joinedDate: '2025-01-08', totalOrders: 65,
    totalSpent: 5120, status: 'active', businessType: 'Bakery',
    avgOrderValue: 78.77, lastOrderDate: '2026-07-21',
  },
  {
    id: '3', name: 'Supermercado Sol', email: 'sol@super.pt', phone: '+351 21 555 0005',
    address: 'Praça do Comércio 8, Lisboa', joinedDate: '2024-11-20', totalOrders: 88,
    totalSpent: 7650, status: 'active', businessType: 'Supermarket',
    avgOrderValue: 86.93, lastOrderDate: '2026-07-22',
  },
  {
    id: '4', name: 'Restaurante Bom Sabor', email: 'info@bomsabor.pt', phone: '+351 21 555 0007',
    address: 'Rua do Ouro 88, Lisboa', joinedDate: '2025-06-15', totalOrders: 28,
    totalSpent: 1890, status: 'active', businessType: 'Restaurant',
    avgOrderValue: 67.50, lastOrderDate: '2026-07-19',
  },
  {
    id: '5', name: 'Mercearia Tradicional', email: 'mercearia@trad.pt', phone: '+351 21 555 0009',
    address: 'Calçada do Carmo 12, Lisboa', joinedDate: '2025-09-01', totalOrders: 14,
    totalSpent: 820, status: 'inactive', businessType: 'Grocery',
    avgOrderValue: 58.57, lastOrderDate: '2026-06-10',
  },
];

export default function CustomerPortalAccountPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<PortalCustomer | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PortalCustomer>>({});

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.businessType.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (customer: PortalCustomer) => {
    setEditing(true);
    setEditForm({ ...customer });
  };

  const handleSave = () => {
    setEditing(false);
    if (selectedCustomer) {
      setSelectedCustomer({ ...selectedCustomer, ...editForm } as PortalCustomer);
    }
  };

  if (selectedCustomer) {
    return (
      <BusinessLayout>
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedCustomer(null); setEditing(false); }}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{selectedCustomer.name}</h1>
                <p className="text-sm text-muted-foreground">Customer Account</p>
              </div>
            </div>
            {!editing ? (
              <button onClick={() => handleEdit(selectedCustomer)} className="btn-secondary text-sm flex items-center gap-2">
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save size={14} /> Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm flex items-center gap-2">
                  <X size={14} /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: selectedCustomer.totalOrders, color: 'text-primary' },
              { label: 'Total Spent', value: `R ${selectedCustomer.totalSpent.toLocaleString()}`, color: 'text-foreground' },
              { label: 'Avg Order', value: `R ${selectedCustomer.avgOrderValue.toFixed(2)}`, color: 'text-foreground' },
              { label: 'Status', value: selectedCustomer.status, color: selectedCustomer.status === 'active' ? 'text-success' : 'text-muted-foreground' },
            ].map((s, i) => (
              <div key={i} className="card-base p-4">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-lg font-bold capitalize ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Contact Details */}
          <div className="card-base p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Contact Details</h3>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Business Name', icon: Building2 },
                  { key: 'email', label: 'Email', icon: Mail },
                  { key: 'phone', label: 'Phone', icon: Phone },
                  { key: 'address', label: 'Address', icon: MapPin },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                    <div className="relative">
                      <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        className="input-field pl-9"
                        value={(editForm as any)[field.key] || ''}
                        onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { icon: Building2, label: 'Business Name', value: selectedCustomer.name },
                  { icon: Mail, label: 'Email', value: selectedCustomer.email },
                  { icon: Phone, label: 'Phone', value: selectedCustomer.phone },
                  { icon: MapPin, label: 'Address', value: selectedCustomer.address },
                  { icon: Building2, label: 'Business Type', value: selectedCustomer.businessType },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <row.icon size={14} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium text-foreground">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account History */}
          <div className="card-base p-6 space-y-3">
            <h3 className="font-semibold text-foreground">Account History</h3>
            {[
              { icon: Calendar, label: 'Member Since', value: selectedCustomer.joinedDate },
              { icon: ShoppingCart, label: 'Last Order', value: selectedCustomer.lastOrderDate },
              { icon: TrendingUp, label: 'Lifetime Value', value: `R ${selectedCustomer.totalSpent.toLocaleString()}` },
              { icon: CheckCircle, label: 'Account Status', value: selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1) },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <row.icon size={14} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{row.label}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{row.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/customer-portal/orders" className="card-base p-4 flex items-center gap-3 hover:border-primary/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">View Orders</p>
                <p className="text-xs text-muted-foreground">{selectedCustomer.totalOrders} total</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary ml-auto" />
            </Link>
            <Link href="/customer-portal/saved" className="card-base p-4 flex items-center gap-3 hover:border-primary/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-danger" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Saved Items</p>
                <p className="text-xs text-muted-foreground">Favourites</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary ml-auto" />
            </Link>
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
              <h1 className="text-2xl font-bold text-foreground">Customer Accounts</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage customer contact details and account info</p>
            </div>
          </div>
          <Link href="/customers" className="btn-primary text-sm flex items-center gap-2 self-start sm:self-auto">
            <Plus size={15} /> Add Customer
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Accounts', value: mockCustomers.length, color: 'text-foreground' },
            { label: 'Active', value: mockCustomers.filter(c => c.status === 'active').length, color: 'text-success' },
            { label: 'Inactive', value: mockCustomers.filter(c => c.status === 'inactive').length, color: 'text-muted-foreground' },
            { label: 'Total Revenue', value: `R ${mockCustomers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}`, color: 'text-primary' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card-base p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or business type..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Customer</th>
                  <th className="table-header hidden sm:table-cell">Type</th>
                  <th className="table-header hidden md:table-cell">Joined</th>
                  <th className="table-header">Orders</th>
                  <th className="table-header hidden lg:table-cell">Spent</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 within-gradient rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {customer.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="text-sm text-foreground">{customer.businessType}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm text-foreground">{customer.joinedDate}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-foreground">{customer.totalOrders}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <span className="font-semibold text-foreground">R {customer.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs capitalize ${customer.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <User size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
