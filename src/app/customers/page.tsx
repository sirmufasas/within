'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import {
  Search, Plus, Filter, Phone, Mail, Eye, Edit2, Trash2,
  X, MapPin, ShoppingCart, DollarSign, User, CheckCircle,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  driver: string;
  orders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinDate: string;
  notes: string;
}

const initialCustomers: Customer[] = [
  { id: 'C001', name: 'Café Central', contactPerson: 'João Silva', phone: '+351 21 555 0001', email: 'central@cafe.pt', address: 'Rua Augusta 45, Lisboa', driver: 'Miguel', orders: 42, totalSpent: 3240, status: 'active', joinDate: '2025-01-15', notes: 'Deliver before 8am' },
  { id: 'C002', name: 'Restaurante O Forno', contactPerson: 'Maria Santos', phone: '+351 21 555 0002', email: 'forno@rest.pt', address: 'Av. da Liberdade 120, Lisboa', driver: 'Ana', orders: 28, totalSpent: 1890, status: 'active', joinDate: '2025-03-10', notes: '' },
  { id: 'C003', name: 'Padaria Estrela', contactPerson: 'Carlos Ferreira', phone: '+351 21 555 0003', email: 'estrela@padaria.pt', address: 'Rua do Ouro 78, Lisboa', driver: 'Miguel', orders: 65, totalSpent: 5120, status: 'active', joinDate: '2024-11-20', notes: 'Preferred morning delivery' },
  { id: 'C004', name: 'Hotel Lisboa', contactPerson: 'Ana Costa', phone: '+351 21 555 0004', email: 'orders@hotel.pt', address: 'Praça do Comércio 1, Lisboa', driver: 'Carlos', orders: 15, totalSpent: 890, status: 'inactive', joinDate: '2025-06-01', notes: 'Seasonal customer' },
  { id: 'C005', name: 'Supermercado Sol', contactPerson: 'Pedro Alves', phone: '+351 21 555 0005', email: 'sol@super.pt', address: 'Estrada de Benfica 500, Lisboa', driver: 'Ana', orders: 88, totalSpent: 7650, status: 'active', joinDate: '2024-09-05', notes: 'Call on arrival' },
  { id: 'C006', name: 'Cantina Universitária', contactPerson: 'Sofia Rodrigues', phone: '+351 21 555 0006', email: 'cantina@uni.pt', address: 'Campus Universitário, Lisboa', driver: 'Carlos', orders: 33, totalSpent: 2100, status: 'active', joinDate: '2025-02-14', notes: '' },
];

const drivers = ['Miguel', 'Ana', 'Carlos', 'Sofia'];

const emptyCustomer: Omit<Customer, 'id' | 'orders' | 'totalSpent' | 'joinDate'> = {
  name: '', contactPerson: '', phone: '', email: '',
  address: '', driver: '', status: 'active', notes: '',
};

function fmt(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState(emptyCustomer);

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!newCustomer.name || !newCustomer.email) return;
    const id = `C${String(customers.length + 1).padStart(3, '0')}`;
    setCustomers(prev => [{
      ...newCustomer,
      id,
      orders: 0,
      totalSpent: 0,
      joinDate: new Date().toISOString().split('T')[0],
    }, ...prev]);
    setNewCustomer(emptyCustomer);
    setShowAddModal(false);
  };

  const handleEditSave = () => {
    if (!editCustomer) return;
    setCustomers(prev => prev.map(c => c.id === editCustomer.id ? editCustomer : c));
    if (selected?.id === editCustomer.id) setSelected(editCustomer);
    setShowEditModal(false);
    setEditCustomer(null);
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer({ ...c });
    setShowEditModal(true);
    setSelected(null);
  };

  const activeCount = customers.filter(c => c.status === 'active').length;
  const totalOrders = customers.reduce((s, c) => s + c.orders, 0);
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{customers.length} total customers</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: customers.length, color: 'text-primary', icon: User },
            { label: 'Active', value: activeCount, color: 'text-success', icon: CheckCircle },
            { label: 'Total Orders', value: fmt(totalOrders), color: 'text-foreground', icon: ShoppingCart },
            { label: 'Total Revenue', value: `R ${fmt(totalRevenue)}`, color: 'text-success', icon: DollarSign },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon size={14} className="text-muted-foreground" />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="card-base p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or contact..."
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No customers found.
                    </td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full within-gradient flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.contactPerson}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={11} />{c.phone}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={11} />{c.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm text-foreground">{c.driver || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-foreground">{c.orders}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <span className="font-semibold text-foreground">R {fmt(c.totalSpent)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${c.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIEW MODAL */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full within-gradient flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {selected.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.contactPerson}</p>
                    <span className={`badge-base text-xs mt-1 inline-block ${selected.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Mail size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{selected.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{selected.address}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xl font-bold text-foreground">{selected.orders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xl font-bold text-success">R {fmt(selected.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm font-bold text-foreground">{selected.driver || '—'}</p>
                  <p className="text-xs text-muted-foreground">Driver</p>
                </div>
              </div>
              {selected.notes && (
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg mb-5">
                  <p className="text-xs text-warning font-medium mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selected.notes}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => openEdit(selected)} className="btn-secondary flex-1 text-sm">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowAddModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Add New Customer</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Business Name *</label>
                    <input type="text" className="input-field" placeholder="e.g. Café Central" value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Contact Person</label>
                    <input type="text" className="input-field" placeholder="Full name" value={newCustomer.contactPerson} onChange={e => setNewCustomer(p => ({ ...p, contactPerson: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Email *</label>
                    <input type="email" className="input-field" placeholder="email@business.com" value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                    <input type="tel" className="input-field" placeholder="+351 21 555 0000" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Address</label>
                    <input type="text" className="input-field" placeholder="Street, City" value={newCustomer.address} onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Assigned Driver</label>
                    <select className="input-field" value={newCustomer.driver} onChange={e => setNewCustomer(p => ({ ...p, driver: e.target.value }))}>
                      <option value="">Select driver...</option>
                      {drivers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                    <select className="input-field" value={newCustomer.status} onChange={e => setNewCustomer(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                    <textarea className="input-field resize-none" rows={2} placeholder="Delivery instructions, preferences..." value={newCustomer.notes} onChange={e => setNewCustomer(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={handleAdd} disabled={!newCustomer.name || !newCustomer.email} className="btn-primary flex-1 text-sm">
                  <Plus size={15} /> Add Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && editCustomer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowEditModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Edit Customer</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Business Name *</label>
                    <input type="text" className="input-field" value={editCustomer.name} onChange={e => setEditCustomer(p => p ? { ...p, name: e.target.value } : null)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Contact Person</label>
                    <input type="text" className="input-field" value={editCustomer.contactPerson} onChange={e => setEditCustomer(p => p ? { ...p, contactPerson: e.target.value } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                    <input type="email" className="input-field" value={editCustomer.email} onChange={e => setEditCustomer(p => p ? { ...p, email: e.target.value } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                    <input type="tel" className="input-field" value={editCustomer.phone} onChange={e => setEditCustomer(p => p ? { ...p, phone: e.target.value } : null)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Address</label>
                    <input type="text" className="input-field" value={editCustomer.address} onChange={e => setEditCustomer(p => p ? { ...p, address: e.target.value } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Assigned Driver</label>
                    <select className="input-field" value={editCustomer.driver} onChange={e => setEditCustomer(p => p ? { ...p, driver: e.target.value } : null)}>
                      <option value="">No driver</option>
                      {drivers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                    <select className="input-field" value={editCustomer.status} onChange={e => setEditCustomer(p => p ? { ...p, status: e.target.value as 'active' | 'inactive' } : null)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                    <textarea className="input-field resize-none" rows={2} value={editCustomer.notes} onChange={e => setEditCustomer(p => p ? { ...p, notes: e.target.value } : null)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={handleEditSave} className="btn-primary flex-1 text-sm">
                  <CheckCircle size={15} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Delete Customer</h3>
                  <p className="text-sm text-muted-foreground">This cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-5">
                Are you sure you want to delete <span className="font-semibold">{customers.find(c => c.id === deleteConfirm)?.name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1 text-sm">
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
