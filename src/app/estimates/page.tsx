'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { Plus, Search, X, FileText, Clock, CheckCircle, XCircle, Send, Download, Trash2, Edit2, Copy,  } from 'lucide-react';

interface EstimateItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface Estimate {
  id: string;
  number: string;
  customer: string;
  customerEmail: string;
  date: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  items: EstimateItem[];
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
}

const mockEstimates: Estimate[] = [
  {
    id: '1',
    number: 'EST-2026-001',
    customer: 'Café Central',
    customerEmail: 'central@cafe.pt',
    date: '2026-07-15',
    validUntil: '2026-08-15',
    status: 'accepted',
    items: [
      { id: 'i1', description: 'Pão de Forma (loaf)', qty: 50, unit: 'loaf', unitPrice: 1.20 },
      { id: 'i2', description: 'Croissant', qty: 100, unit: 'unit', unitPrice: 1.50 },
      { id: 'i3', description: 'Baguette', qty: 80, unit: 'unit', unitPrice: 0.80 },
    ],
    notes: 'Weekly standing order estimate. Prices valid for 30 days.',
    subtotal: 274.00,
    tax: 27.40,
    total: 301.40,
  },
  {
    id: '2',
    number: 'EST-2026-002',
    customer: 'Padaria Estrela',
    customerEmail: 'estrela@padaria.pt',
    date: '2026-07-18',
    validUntil: '2026-08-18',
    status: 'sent',
    items: [
      { id: 'i4', description: 'Farinha T65', qty: 200, unit: 'kg', unitPrice: 1.80 },
      { id: 'i5', description: 'Bolo de Arroz', qty: 60, unit: 'unit', unitPrice: 1.50 },
    ],
    notes: 'Bulk order estimate for August supply.',
    subtotal: 450.00,
    tax: 45.00,
    total: 495.00,
  },
  {
    id: '3',
    number: 'EST-2026-003',
    customer: 'Supermercado Sol',
    customerEmail: 'sol@super.pt',
    date: '2026-07-20',
    validUntil: '2026-08-20',
    status: 'draft',
    items: [
      { id: 'i6', description: 'Pão de Forma (loaf)', qty: 200, unit: 'loaf', unitPrice: 1.20 },
      { id: 'i7', description: 'Croissant', qty: 300, unit: 'unit', unitPrice: 1.50 },
      { id: 'i8', description: 'Farinha T65', qty: 100, unit: 'kg', unitPrice: 1.80 },
    ],
    notes: 'Monthly supply estimate. Subject to availability.',
    subtotal: 870.00,
    tax: 87.00,
    total: 957.00,
  },
  {
    id: '4',
    number: 'EST-2026-004',
    customer: 'Hotel Bairro Alto',
    customerEmail: 'orders@bairroalto.pt',
    date: '2026-07-10',
    validUntil: '2026-07-25',
    status: 'expired',
    items: [
      { id: 'i9', description: 'Croissant', qty: 500, unit: 'unit', unitPrice: 1.50 },
      { id: 'i10', description: 'Bolo de Arroz', qty: 200, unit: 'unit', unitPrice: 1.50 },
    ],
    notes: 'Event catering estimate for July conference.',
    subtotal: 1050.00,
    tax: 105.00,
    total: 1155.00,
  },
  {
    id: '5',
    number: 'EST-2026-005',
    customer: 'Restaurante Fado',
    customerEmail: 'fado@restaurante.pt',
    date: '2026-07-22',
    validUntil: '2026-08-22',
    status: 'declined',
    items: [
      { id: 'i11', description: 'Baguette', qty: 150, unit: 'unit', unitPrice: 0.80 },
      { id: 'i12', description: 'Pão de Forma (loaf)', qty: 30, unit: 'loaf', unitPrice: 1.20 },
    ],
    notes: 'Weekly bread supply estimate.',
    subtotal: 156.00,
    tax: 15.60,
    total: 171.60,
  },
];

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', bg: 'bg-[#fdf8f1]', text: 'text-[#6b5544]', icon: FileText },
  sent: { label: 'Sent', bg: 'bg-blue-100', text: 'text-blue-800', icon: Send },
  accepted: { label: 'Accepted', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  declined: { label: 'Declined', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  expired: { label: 'Expired', bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock },
};

type FilterType = 'all' | 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export default function EstimatesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = mockEstimates.filter((e) => {
    const matchesSearch =
      e.number.toLowerCase().includes(search.toLowerCase()) ||
      e.customer.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalValue = mockEstimates.reduce((s, e) => s + e.total, 0);
  const acceptedValue = mockEstimates.filter(e => e.status === 'accepted').reduce((s, e) => s + e.total, 0);
  const pendingCount = mockEstimates.filter(e => e.status === 'sent').length;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2a1810]">Estimates</h1>
            <p className="text-sm text-[#8b6f4e] mt-0.5">Create and manage price estimates for customers</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-[#c8362b] hover:bg-[#a82a22] text-white font-bold transition-colors"
          >
            <Plus size={15} /> New Estimate
          </button>
        </div>

        {/* Summary Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Estimates', value: mockEstimates.length.toString() },
            { label: 'Pending', value: pendingCount.toString() },
            { label: 'Accepted Value', value: `R ${acceptedValue.toFixed(0)}` },
            { label: 'Total Pipeline', value: `R ${totalValue.toFixed(0)}` },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8dcc8] p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-[#8b6f4e] font-semibold">{s.label}</div>
              <div className="text-xl font-bold mt-1 text-[#2a1810]">{s.value}</div>
            </div>
          ))}
        </section>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-white border border-[#e8dcc8] rounded-xl p-1 flex-wrap">
            {(['all', 'draft', 'sent', 'accepted', 'declined', 'expired'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-[#c8362b] text-white'
                    : 'text-[#6b5544] hover:bg-[#fdf8f1]'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f4e]" />
            <input
              type="text"
              placeholder="Search estimates..."
              className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2 pl-9 text-sm text-[#2a1810] placeholder:text-[#8b6f4e] focus:outline-none focus:border-[#c8362b] transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Estimates List */}
        <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center text-xl mb-3">📄</div>
              <p className="font-bold text-[#2a1810]">No estimates found</p>
              <p className="text-xs text-[#8b6f4e] mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e8dcc8]">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[#fdf8f1]">
                <span className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider">Estimate</span>
                <span className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider">Customer</span>
                <span className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider">Date</span>
                <span className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider">Valid Until</span>
                <span className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider">Total</span>
                <span className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider">Status</span>
              </div>
              {filtered.map((est) => {
                const sc = statusConfig[est.status];
                const StatusIcon = sc.icon;
                return (
                  <div
                    key={est.id}
                    className="px-5 py-4 hover:bg-[#fdf8f1] transition-colors cursor-pointer"
                    onClick={() => setSelectedEstimate(est)}
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-[#c8362b]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2a1810] text-sm">{est.number}</p>
                          <p className="text-xs text-[#8b6f4e]">{est.customer}</p>
                          <p className="text-xs text-[#8b6f4e] mt-0.5">{est.date} · Valid until {est.validUntil}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <StatusIcon size={10} />
                          {sc.label}
                        </span>
                        <p className="text-sm font-bold text-[#2a1810]">R {est.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#fdf8f1] border border-[#e8dcc8] flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-[#c8362b]" />
                        </div>
                        <span className="font-bold text-[#2a1810] text-sm truncate">{est.number}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#2a1810] text-sm truncate">{est.customer}</p>
                        <p className="text-xs text-[#8b6f4e] truncate">{est.customerEmail}</p>
                      </div>
                      <span className="text-sm text-[#8b6f4e] whitespace-nowrap">{est.date}</span>
                      <span className="text-sm text-[#8b6f4e] whitespace-nowrap">{est.validUntil}</span>
                      <span className="text-sm font-bold text-[#2a1810] whitespace-nowrap">R {est.total.toFixed(2)}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${sc.bg} ${sc.text}`}>
                        <StatusIcon size={10} />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Estimate Detail Modal */}
        {selectedEstimate && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEstimate(null)}
          >
            <div
              className="bg-white rounded-2xl border border-[#e8dcc8] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-[#e8dcc8]">
                <div>
                  <h3 className="text-lg font-bold text-[#2a1810]">{selectedEstimate.number}</h3>
                  <p className="text-sm text-[#8b6f4e]">{selectedEstimate.customer} · {selectedEstimate.customerEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const sc = statusConfig[selectedEstimate.status];
                    const StatusIcon = sc.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                        <StatusIcon size={10} />
                        {sc.label}
                      </span>
                    );
                  })()}
                  <button
                    onClick={() => setSelectedEstimate(null)}
                    className="p-1.5 rounded-lg hover:bg-[#fdf8f1] text-[#8b6f4e] hover:text-[#2a1810] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#fdf8f1] rounded-xl border border-[#e8dcc8]">
                    <p className="text-xs text-[#8b6f4e] uppercase tracking-wider font-semibold">Date Issued</p>
                    <p className="text-sm font-bold text-[#2a1810] mt-1">{selectedEstimate.date}</p>
                  </div>
                  <div className="p-3 bg-[#fdf8f1] rounded-xl border border-[#e8dcc8]">
                    <p className="text-xs text-[#8b6f4e] uppercase tracking-wider font-semibold">Valid Until</p>
                    <p className="text-sm font-bold text-[#2a1810] mt-1">{selectedEstimate.validUntil}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h4 className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider mb-3">Line Items</h4>
                  <div className="bg-[#fdf8f1] rounded-xl border border-[#e8dcc8] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e8dcc8]">
                          <th className="text-xs font-semibold text-[#8b6f4e] px-4 py-2.5 text-left">Description</th>
                          <th className="text-xs font-semibold text-[#8b6f4e] px-4 py-2.5 text-right">Qty</th>
                          <th className="text-xs font-semibold text-[#8b6f4e] px-4 py-2.5 text-right">Unit Price</th>
                          <th className="text-xs font-semibold text-[#8b6f4e] px-4 py-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEstimate.items.map((item) => (
                          <tr key={item.id} className="border-b border-[#e8dcc8] last:border-0">
                            <td className="px-4 py-3 text-sm text-[#2a1810] font-medium">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-[#8b6f4e] text-right">{item.qty} {item.unit}</td>
                            <td className="px-4 py-3 text-sm text-[#8b6f4e] text-right">R {item.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-[#2a1810] text-right">R {(item.qty * item.unitPrice).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-[#fdf8f1] rounded-xl border border-[#e8dcc8] p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b6f4e]">Subtotal</span>
                    <span className="font-semibold text-[#2a1810]">R {selectedEstimate.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b6f4e]">Tax (10%)</span>
                    <span className="font-semibold text-[#2a1810]">R {selectedEstimate.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#e8dcc8]">
                    <span className="font-bold text-[#2a1810]">Total</span>
                    <span className="font-bold text-[#c8362b] text-base">R {selectedEstimate.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedEstimate.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#8b6f4e] uppercase tracking-wider mb-2">Notes</h4>
                    <p className="text-sm text-[#6b5544] bg-[#fdf8f1] rounded-xl border border-[#e8dcc8] p-3">{selectedEstimate.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedEstimate.status === 'draft' && (
                    <button className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-[#c8362b] hover:bg-[#a82a22] text-white font-bold transition-colors">
                      <Send size={14} /> Send to Customer
                    </button>
                  )}
                  <button className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors">
                    <Download size={14} /> Download PDF
                  </button>
                  <button className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors">
                    <Copy size={14} /> Duplicate
                  </button>
                  <button className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Estimate Modal */}
        {showNewModal && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewModal(false)}
          >
            <div
              className="bg-white rounded-2xl border border-[#e8dcc8] shadow-xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <h3 className="text-lg font-bold text-[#2a1810]">New Estimate</h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[#fdf8f1] text-[#8b6f4e] hover:text-[#2a1810] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Customer</label>
                  <select className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors">
                    <option value="">Select a customer...</option>
                    <option>Café Central</option>
                    <option>Padaria Estrela</option>
                    <option>Supermercado Sol</option>
                    <option>Hotel Bairro Alto</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Issue Date</label>
                    <input type="date" className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Valid Until</label>
                    <input type="date" className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2a1810] mb-1.5">Notes</label>
                  <textarea
                    className="w-full bg-[#fdf8f1] border border-[#e8dcc8] rounded-xl px-4 py-2.5 text-sm text-[#2a1810] focus:outline-none focus:border-[#c8362b] transition-colors resize-none"
                    rows={3}
                    placeholder="Add any notes or terms..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-[#e8dcc8] bg-white hover:bg-[#fdf8f1] text-[#6b5544] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl bg-[#c8362b] hover:bg-[#a82a22] text-white font-bold transition-colors"
                >
                  Create Estimate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
