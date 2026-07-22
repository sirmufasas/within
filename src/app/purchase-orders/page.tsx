'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Plus, Eye, Edit, Phone, Mail, Building2, Search } from 'lucide-react';

const mockSuppliers = [
  { id: '1', name: 'Moinho Nacional', contact: 'Carlos Ferreira', email: 'carlos@moinho.pt', phone: '+351 21 555 0001', paymentTerms: 'net30', orders: 12, totalSpent: 8500, status: 'active' },
  { id: '2', name: 'Lacticinios do Norte', contact: 'Ana Costa', email: 'ana@lacticinios.pt', phone: '+351 22 555 0002', paymentTerms: 'net15', orders: 8, totalSpent: 4200, status: 'active' },
  { id: '3', name: 'Distribuidora Central', contact: 'Pedro Lima', email: 'pedro@distrib.pt', phone: '+351 21 555 0003', paymentTerms: 'net30', orders: 5, totalSpent: 2100, status: 'inactive' },
];

const mockPurchaseOrders = [
  { id: 'PO-2026-001', supplier: 'Moinho Nacional', items: 3, total: 170.00, status: 'received', date: '2026-07-01', expectedDate: '2026-07-05' },
  { id: 'PO-2026-002', supplier: 'Lacticinios do Norte', items: 2, total: 225.00, status: 'sent', date: '2026-07-18', expectedDate: '2026-07-22' },
  { id: 'PO-2026-003', supplier: 'Moinho Nacional', items: 4, total: 340.00, status: 'draft', date: '2026-07-22', expectedDate: '2026-07-28' },
];

const poStatusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-info/10 text-info',
  partial: 'bg-warning/10 text-warning',
  received: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

export default function PurchaseOrdersPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchase-orders'>('suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState<typeof mockSuppliers[0] | null>(null);
  const [selectedPO, setSelectedPO] = useState<typeof mockPurchaseOrders[0] | null>(null);
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suppliers & Purchase Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockSuppliers.length} suppliers · {mockPurchaseOrders.length} purchase orders</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'suppliers' ? (
              <button className="btn-primary text-sm">
                <Plus size={16} /> Add Supplier
              </button>
            ) : (
              <button onClick={() => setShowNewPOModal(true)} className="btn-primary text-sm">
                <Plus size={16} /> New Purchase Order
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['suppliers', 'purchase-orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'suppliers' ? 'Suppliers' : 'Purchase Orders'}
            </button>
          ))}
        </div>

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="card-base p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  className="input-field pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-base overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="table-header">Supplier</th>
                      <th className="table-header hidden sm:table-cell">Contact</th>
                      <th className="table-header hidden md:table-cell">Terms</th>
                      <th className="table-header">Orders</th>
                      <th className="table-header hidden lg:table-cell">Total Spent</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSuppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-muted/20 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Building2 size={16} className="text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{supplier.name}</p>
                              <p className="text-xs text-muted-foreground">{supplier.contact}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell hidden sm:table-cell">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone size={11} />{supplier.phone}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail size={11} />{supplier.email}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell hidden md:table-cell">
                          <span className="text-sm text-foreground">{supplier.paymentTerms}</span>
                        </td>
                        <td className="table-cell">
                          <span className="font-semibold text-foreground">{supplier.orders}</span>
                        </td>
                        <td className="table-cell hidden lg:table-cell">
                          <span className="font-semibold text-foreground">R {supplier.totalSpent.toLocaleString()}</span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge-base text-xs ${supplier.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {supplier.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => setSelectedSupplier(supplier)}
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
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'purchase-orders' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">PO Number</th>
                    <th className="table-header">Supplier</th>
                    <th className="table-header hidden sm:table-cell">Items</th>
                    <th className="table-header">Total</th>
                    <th className="table-header hidden md:table-cell">Expected</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <p className="font-mono text-sm font-semibold text-foreground">{po.id}</p>
                        <p className="text-xs text-muted-foreground">{po.date}</p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm font-medium text-foreground">{po.supplier}</p>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-foreground">{po.items} items</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-foreground">R {po.total.toFixed(2)}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-sm text-foreground">{po.expectedDate}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs capitalize ${poStatusColors[po.status] || 'bg-muted text-muted-foreground'}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelectedPO(po)}
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
        )}

        {/* Supplier Detail Modal */}
        {selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedSupplier(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedSupplier.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.contact}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedSupplier.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedSupplier.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xl font-bold text-foreground">{selectedSupplier.orders}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xl font-bold text-foreground">R {selectedSupplier.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 text-sm">Edit Supplier</button>
                <button onClick={() => setSelectedSupplier(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* PO Detail Modal */}
        {selectedPO && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedPO(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedPO.id}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPO.supplier}</p>
                </div>
                <span className={`badge-base capitalize ${poStatusColors[selectedPO.status]}`}>{selectedPO.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="text-sm font-bold text-foreground">{selectedPO.date}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Expected</p>
                  <p className="text-sm font-bold text-foreground">{selectedPO.expectedDate}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-xl font-bold text-foreground">{selectedPO.items}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">R {selectedPO.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 text-sm">Edit PO</button>
                <button onClick={() => setSelectedPO(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* New PO Modal */}
        {showNewPOModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowNewPOModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-6">New Purchase Order</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Supplier</label>
                  <select className="input-field">
                    {mockSuppliers.map(s => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Order Date</label>
                    <input type="date" className="input-field" defaultValue="2026-07-22" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Expected Date</label>
                    <input type="date" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
                  <textarea className="input-field" rows={2} placeholder="Optional notes..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewPOModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => setShowNewPOModal(false)} className="btn-primary flex-1 text-sm">Create PO</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
