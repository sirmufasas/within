'use client';
import React, { useState } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Search, Plus, Eye, Building2, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const mockBusinesses = [
  { id: '1', name: 'Padaria Sao Joao', type: 'bakery', owner: 'Joao Silva', email: 'admin@padariasaojoao.pt', plan: 'professional', status: 'active', joinDate: '2026-01-15', mrr: 599 },
  { id: '2', name: 'Fresh Cuts Butchery', type: 'butchery', owner: 'Maria Santos', email: 'owner@freshcuts.co.za', plan: 'starter', status: 'trial', joinDate: '2026-07-10', mrr: 0 },
  { id: '3', name: 'Café Lisboa', type: 'coffee-shop', owner: 'Pedro Alves', email: 'pedro@cafelisboa.pt', plan: 'starter', status: 'expired', joinDate: '2026-03-20', mrr: 0 },
  { id: '4', name: 'Distribuidora Norte', type: 'distributor', owner: 'Ana Ferreira', email: 'ana@distnorte.pt', plan: 'enterprise', status: 'active', joinDate: '2025-11-01', mrr: 1299 },
  { id: '5', name: 'Restaurante Bom Sabor', type: 'restaurant', owner: 'Carlos Lima', email: 'carlos@bomsabor.pt', plan: 'professional', status: 'suspended', joinDate: '2026-02-28', mrr: 0 },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-success/10 text-success', icon: <CheckCircle size={12} /> },
  trial: { label: 'Trial', color: 'bg-info/10 text-info', icon: <Clock size={12} /> },
  expired: { label: 'Expired', color: 'bg-danger/10 text-danger', icon: <XCircle size={12} /> },
  suspended: { label: 'Suspended', color: 'bg-warning/10 text-warning', icon: <AlertTriangle size={12} /> },
};

export default function SuperAdminBusinessesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<typeof mockBusinesses[0] | null>(null);

  const filtered = mockBusinesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <SuperAdminLayout adminName="Ricardo Alves" suspendedCount={2} expiringCount={5}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Businesses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockBusinesses.length} registered businesses</p>
          </div>
          <button className="btn-primary text-sm">
            <Plus size={16} /> Onboard Business
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: mockBusinesses.length, color: 'text-foreground' },
            { label: 'Active', value: mockBusinesses.filter(b => b.status === 'active').length, color: 'text-success' },
            { label: 'Trial', value: mockBusinesses.filter(b => b.status === 'trial').length, color: 'text-info' },
            { label: 'Suspended', value: mockBusinesses.filter(b => b.status === 'suspended').length, color: 'text-warning' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-base p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search businesses..."
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'active', 'trial', 'expired', 'suspended'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
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
                  <th className="table-header">Business</th>
                  <th className="table-header hidden sm:table-cell">Owner</th>
                  <th className="table-header hidden md:table-cell">Plan</th>
                  <th className="table-header hidden lg:table-cell">MRR</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((biz) => {
                  const status = statusConfig[biz.status];
                  return (
                    <tr key={biz.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Building2 size={16} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{biz.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{biz.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <p className="text-sm text-foreground">{biz.owner}</p>
                        <p className="text-xs text-muted-foreground">{biz.email}</p>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="badge-base bg-primary/10 text-primary text-xs capitalize">{biz.plan}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="font-semibold text-foreground">R {biz.mrr.toLocaleString()}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs flex items-center gap-1 w-fit ${status.color}`}>
                          {status.icon}{status.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelected(biz)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Business Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selected.type}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-bold text-foreground capitalize">{selected.plan}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">MRR</p>
                    <p className="text-sm font-bold text-foreground">R {selected.mrr.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={`badge-base text-xs capitalize ${statusConfig[selected.status].color}`}>
                      {selected.status}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-bold text-foreground">{selected.joinDate}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {selected.status !== 'suspended' && (
                  <button className="btn-danger flex-1 text-sm">Suspend</button>
                )}
                {selected.status === 'suspended' && (
                  <button className="btn-secondary flex-1 text-sm">Reactivate</button>
                )}
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
