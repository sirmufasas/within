'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Warehouse, Package, ArrowRightLeft, Plus, Eye, AlertTriangle, Calendar } from 'lucide-react';

const mockWarehouses = [
  { id: '1', name: 'Main Bakery', address: '12 Rua das Flores, Lisboa', isDefault: true, locations: 3, totalItems: 12 },
  { id: '2', name: 'Cold Storage', address: '12 Rua das Flores, Lisboa', isDefault: false, locations: 2, totalItems: 5 },
];

const mockBatches = [
  { id: '1', product: 'Farinha T65', batchNo: 'BATCH-2026-001', qty: 200, unit: 'kg', location: 'Dry Store A', expiryDate: '2027-07-01', status: 'ok' },
  { id: '2', product: 'Manteiga', batchNo: 'BATCH-2026-002', qty: 50, unit: 'kg', location: 'Fridge 1', expiryDate: '2026-08-15', status: 'ok' },
  { id: '3', product: 'Pão de Forma', batchNo: 'BATCH-2026-003', qty: 300, unit: 'unit', location: 'Dry Store A', expiryDate: '2026-07-27', status: 'expiring' },
  { id: '4', product: 'Leite', batchNo: 'BATCH-2026-004', qty: 20, unit: 'L', location: 'Fridge 1', expiryDate: '2026-07-24', status: 'critical' },
];

const mockMovements = [
  { id: '1', type: 'purchase', product: 'Farinha T65', qty: 200, from: '-', to: 'Dry Store A', date: '2026-07-20', ref: 'PO-2026-001' },
  { id: '2', type: 'sale', product: 'Pão de Forma', qty: 50, from: 'Dry Store A', to: '-', date: '2026-07-21', ref: 'ORD-001' },
  { id: '3', type: 'transfer', product: 'Manteiga', qty: 10, from: 'Fridge 1', to: 'Main Counter', date: '2026-07-22', ref: 'TRF-001' },
  { id: '4', type: 'production', product: 'Pão de Forma', qty: 100, from: '-', to: 'Dry Store A', date: '2026-07-22', ref: 'PROD-001' },
];

const movementColors: Record<string, string> = {
  purchase: 'bg-success/10 text-success',
  sale: 'bg-danger/10 text-danger',
  transfer: 'bg-info/10 text-info',
  production: 'bg-primary/10 text-primary',
  adjustment: 'bg-warning/10 text-warning',
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'batches' | 'movements'>('warehouses');
  const [selectedBatch, setSelectedBatch] = useState<typeof mockBatches[0] | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Warehouses, batches, and stock movements</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTransferModal(true)} className="btn-secondary text-sm">
              <ArrowRightLeft size={16} /> Transfer Stock
            </button>
            <button className="btn-primary text-sm">
              <Plus size={16} /> Add Stock
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Warehouses', value: '2', icon: Warehouse, color: 'text-primary' },
            { label: 'Active Batches', value: '4', icon: Package, color: 'text-foreground' },
            { label: 'Expiring Soon', value: '2', icon: AlertTriangle, color: 'text-warning' },
            { label: 'Movements Today', value: '4', icon: ArrowRightLeft, color: 'text-info' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['warehouses', 'batches', 'movements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockWarehouses.map((wh) => (
              <div key={wh.id} className="card-base p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Warehouse size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{wh.name}</p>
                      {wh.isDefault && (
                        <span className="badge-base bg-primary/10 text-primary text-xs">Default</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{wh.address}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-lg font-bold text-foreground">{wh.locations}</p>
                    <p className="text-xs text-muted-foreground">Locations</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-lg font-bold text-foreground">{wh.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="card-base p-5 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all min-h-[160px]">
              <Plus size={24} />
              <span className="text-sm font-medium">Add Warehouse</span>
            </button>
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">Product</th>
                    <th className="table-header hidden sm:table-cell">Batch #</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header hidden md:table-cell">Location</th>
                    <th className="table-header">Expiry</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-foreground text-sm">{batch.product}</p>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">{batch.batchNo}</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-foreground">{batch.qty} {batch.unit}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-sm text-foreground">{batch.location}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">{batch.expiryDate}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs ${
                          batch.status === 'ok' ? 'bg-success/10 text-success' :
                          batch.status === 'expiring'? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                        }`}>
                          {batch.status === 'ok' ? 'Good' : batch.status === 'expiring' ? 'Expiring' : 'Critical'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelectedBatch(batch)}
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

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">Type</th>
                    <th className="table-header">Product</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header hidden sm:table-cell">From</th>
                    <th className="table-header hidden sm:table-cell">To</th>
                    <th className="table-header hidden md:table-cell">Reference</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMovements.map((mv) => (
                    <tr key={mv.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <span className={`badge-base text-xs capitalize ${movementColors[mv.type] || 'bg-muted text-muted-foreground'}`}>
                          {mv.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <p className="font-medium text-foreground text-sm">{mv.product}</p>
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-foreground">{mv.qty}</span>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{mv.from}</span>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-foreground">{mv.to}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">{mv.ref}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-muted-foreground">{mv.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Batch Detail Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedBatch(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-2">{selectedBatch.product}</h3>
              <p className="text-sm text-muted-foreground mb-6">Batch: {selectedBatch.batchNo}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-xl font-bold text-foreground">{selectedBatch.qty} {selectedBatch.unit}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-xl font-bold text-foreground">{selectedBatch.location}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg col-span-2">
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <p className="text-xl font-bold text-foreground">{selectedBatch.expiryDate}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTransferModal(true)} className="btn-secondary flex-1 text-sm">
                  <ArrowRightLeft size={14} /> Transfer
                </button>
                <button onClick={() => setSelectedBatch(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowTransferModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-6">Transfer Stock</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Product</label>
                  <select className="input-field">
                    {mockBatches.map(b => <option key={b.id}>{b.product} — {b.batchNo}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">From Location</label>
                    <select className="input-field">
                      <option>Dry Store A</option>
                      <option>Fridge 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">To Location</label>
                    <select className="input-field">
                      <option>Fridge 1</option>
                      <option>Dry Store A</option>
                      <option>Main Counter</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Quantity</label>
                  <input type="number" className="input-field" placeholder="0" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
                  <textarea className="input-field" rows={2} placeholder="Optional notes..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowTransferModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => setShowTransferModal(false)} className="btn-primary flex-1 text-sm">Transfer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
