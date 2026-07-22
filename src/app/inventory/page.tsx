'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Warehouse, ArrowRightLeft, Plus, Eye, Calendar, X } from 'lucide-react';

const mockWarehouses = [
  { id: '1', name: 'Main Bakery', address: '12 Rua das Flores, Lisboa', isDefault: true, locations: 3, totalItems: 12 },
  { id: '2', name: 'Cold Storage', address: '12 Rua das Flores, Lisboa', isDefault: false, locations: 2, totalItems: 5 },
];

const mockBatches = [
  { id: '1', product: 'Farinha T65', batchNo: 'BATCH-2026-001', qty: 200, unit: 'kg', location: 'Dry Store A', expiryDate: '2027-07-01', status: 'ok' },
  { id: '2', product: 'Manteiga', batchNo: 'BATCH-2026-002', qty: 50, unit: 'kg', location: 'Fridge 1', expiryDate: '2026-08-15', status: 'ok' },
  { id: '3', product: 'Pão de Forma', batchNo: 'BATCH-2026-003', qty: 300, unit: 'unit', location: 'Dry Store A', expiryDate: '2026-07-27', status: 'expiring' },
  { id: '4', product: 'Leite', batchNo: 'BATCH-2026-004', qty: 20, unit: 'L', location: 'Fridge 1', expiryDate: '2026-07-24', status: 'critical' },
  { id: '5', product: 'Açúcar', batchNo: 'BATCH-2026-005', qty: 150, unit: 'kg', location: 'Dry Store A', expiryDate: '2028-01-01', status: 'ok' },
  { id: '6', product: 'Ovos', batchNo: 'BATCH-2026-006', qty: 240, unit: 'unit', location: 'Fridge 1', expiryDate: '2026-08-01', status: 'ok' },
];

const mockMovements = [
  { id: '1', type: 'purchase', product: 'Farinha T65', qty: 200, from: '—', to: 'Dry Store A', date: '2026-07-20', ref: 'PO-2026-001' },
  { id: '2', type: 'sale', product: 'Pão de Forma', qty: 50, from: 'Dry Store A', to: '—', date: '2026-07-21', ref: 'ORD-001' },
  { id: '3', type: 'transfer', product: 'Manteiga', qty: 10, from: 'Fridge 1', to: 'Main Counter', date: '2026-07-22', ref: 'TRF-001' },
  { id: '4', type: 'production', product: 'Pão de Forma', qty: 100, from: '—', to: 'Dry Store A', date: '2026-07-22', ref: 'PROD-001' },
  { id: '5', type: 'adjustment', product: 'Leite', qty: 5, from: 'Fridge 1', to: '—', date: '2026-07-23', ref: 'ADJ-001' },
];

const movementStyle: Record<string, { bg: string; text: string }> = {
  purchase: { bg: 'bg-green-100', text: 'text-green-800' },
  sale: { bg: 'bg-red-100', text: 'text-red-700' },
  transfer: { bg: 'bg-blue-100', text: 'text-blue-800' },
  production: { bg: 'bg-amber-100', text: 'text-amber-800' },
  adjustment: { bg: 'bg-[#fdf8f1]', text: 'text-[#6b5544]' },
};

const batchStatusStyle: Record<string, { bg: string; text: string; label: string }> = {
  ok: { bg: 'bg-green-100', text: 'text-green-800', label: 'Good' },
  expiring: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Expiring' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
};

type TabType = 'warehouses' | 'batches' | 'movements';
type Batch = typeof mockBatches[0];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('warehouses');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const expiringCount = mockBatches.filter(b => b.status === 'expiring' || b.status === 'critical').length;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2a1810]">Stocks</h1>
            <p className="text-sm text-[#8b6f4e] mt-0.5">Warehouses, batches, and stock movements</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors"
            >
              <ArrowRightLeft size={15} /> Transfer
            </button>
            <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-[#c8362b] hover:bg-[#a82a22] text-white font-bold transition-colors">
              <Plus size={15} /> Add Stock
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Warehouses', value: mockWarehouses.length.toString() },
            { label: 'Active Batches', value: mockBatches.length.toString() },
            { label: 'Expiring Soon', value: expiringCount.toString() },
            { label: 'Movements Today', value: mockMovements.filter(m => m.date === '2026-07-23').length.toString() },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8dcc8] p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-[#8b6f4e] font-semibold">{s.label}</div>
              <div className="text-xl font-bold mt-1 text-[#2a1810]">{s.value}</div>
            </div>
          ))}
        </section>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-white border border-[#e8dcc8] rounded-xl p-1 w-fit flex-wrap">
          {(['warehouses', 'batches', 'movements'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[#c8362b] text-white'
                  : 'text-[#6b5544] hover:bg-[#fdf8f1]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockWarehouses.map((wh) => (
              <div key={wh.id} className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center">
                      <Warehouse size={20} className="text-[#c8362b]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2a1810]">{wh.name}</p>
                      {wh.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#fdf8f1] text-[#c8362b] border border-[#e8dcc8]">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#8b6f4e] mb-4">{wh.address}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#fdf8f1] rounded-xl text-center border border-[#e8dcc8]">
                    <p className="text-lg font-bold text-[#2a1810]">{wh.locations}</p>
                    <p className="text-xs text-[#8b6f4e]">Locations</p>
                  </div>
                  <div className="p-3 bg-[#fdf8f1] rounded-xl text-center border border-[#e8dcc8]">
                    <p className="text-lg font-bold text-[#2a1810]">{wh.totalItems}</p>
                    <p className="text-xs text-[#8b6f4e]">Products</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="bg-white rounded-2xl border-2 border-dashed border-[#e8dcc8] p-5 flex flex-col items-center justify-center gap-2 text-[#8b6f4e] hover:text-[#c8362b] hover:border-[#c8362b]/40 hover:bg-[#fdf8f1] transition-all min-h-[180px]">
              <Plus size={24} />
              <span className="text-sm font-semibold">Add Warehouse</span>
            </button>
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8dcc8] bg-[#fdf8f1]">
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Product</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left hidden sm:table-cell">Batch #</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Quantity</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left hidden md:table-cell">Location</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Expiry</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Status</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBatches.map((batch) => {
                    const st = batchStatusStyle[batch.status] || batchStatusStyle.ok;
                    return (
                      <tr key={batch.id} className="hover:bg-[#fdf8f1] transition-colors border-b border-[#e8dcc8] last:border-0">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#2a1810] text-sm">{batch.product}</p>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="font-mono text-xs text-[#8b6f4e]">{batch.batchNo}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-[#2a1810]">{batch.qty} {batch.unit}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-[#2a1810]">{batch.location}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#8b6f4e]" />
                            <span className="text-sm text-[#2a1810]">{batch.expiryDate}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setSelectedBatch(batch)}
                            className="p-1.5 rounded-lg hover:bg-[#fdf8f1] border border-transparent hover:border-[#e8dcc8] text-[#8b6f4e] hover:text-[#c8362b] transition-colors"
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
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8dcc8] bg-[#fdf8f1]">
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Type</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Product</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Qty</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left hidden sm:table-cell">From</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left hidden sm:table-cell">To</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left hidden md:table-cell">Reference</th>
                    <th className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMovements.map((mv) => {
                    const ms = movementStyle[mv.type] || movementStyle.adjustment;
                    return (
                      <tr key={mv.id} className="hover:bg-[#fdf8f1] transition-colors border-b border-[#e8dcc8] last:border-0">
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ms.bg} ${ms.text}`}>
                            {mv.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#2a1810] text-sm">{mv.product}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-[#2a1810]">{mv.qty}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-sm text-[#8b6f4e]">{mv.from}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-sm text-[#2a1810]">{mv.to}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="font-mono text-xs text-[#8b6f4e]">{mv.ref}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-[#8b6f4e]">{mv.date}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Batch Detail Modal */}
        {selectedBatch && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBatch(null)}
          >
            <div
              className="bg-white rounded-2xl border border-[#e8dcc8] shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-bold text-[#2a1810]">{selectedBatch.product}</h3>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-1.5 rounded-lg hover:bg-[#fdf8f1] text-[#8b6f4e] hover:text-[#2a1810] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-[#8b6f4e] mb-5">Batch: {selectedBatch.batchNo}</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-[#fdf8f1] rounded-xl border border-[#e8dcc8]">
                  <p className="text-xs text-[#8b6f4e]">Quantity</p>
                  <p className="text-xl font-bold text-[#2a1810]">{selectedBatch.qty} {selectedBatch.unit}</p>
                </div>
                <div className="p-3 bg-[#fdf8f1] rounded-xl border border-[#e8dcc8]">
                  <p className="text-xs text-[#8b6f4e]">Location</p>
                  <p className="text-xl font-bold text-[#2a1810]">{selectedBatch.location}</p>
                </div>
                <div className="p-3 bg-[#fdf8f1] rounded-xl border border-[#e8dcc8] col-span-2">
                  <p className="text-xs text-[#8b6f4e]">Expiry Date</p>
                  <p className="text-xl font-bold text-[#2a1810]">{selectedBatch.expiryDate}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowTransferModal(true); setSelectedBatch(null); }}
                  className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors"
                >
                  <ArrowRightLeft size={14} /> Transfer
                </button>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl bg-[#c8362b] hover:bg-[#a82a22] text-white font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTransferModal(false)}
          >
            <div
              className="bg-white rounded-2xl border border-[#e8dcc8] shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <h3 className="text-lg font-bold text-[#2a1810]">Transfer Stock</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[#fdf8f1] text-[#8b6f4e] hover:text-[#2a1810] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Product</label>
                  <select className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors">
                    {mockBatches.map(b => <option key={b.id}>{b.product} — {b.batchNo}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">From Location</label>
                    <select className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors">
                      <option>Dry Store A</option>
                      <option>Fridge 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">To Location</label>
                    <select className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors">
                      <option>Fridge 1</option>
                      <option>Dry Store A</option>
                      <option>Main Counter</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Quantity</label>
                  <input type="number" className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors" placeholder="0" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Notes</label>
                  <textarea className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors resize-none" rows={2} placeholder="Optional notes..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl bg-[#c8362b] hover:bg-[#a82a22] text-white font-bold transition-colors"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
