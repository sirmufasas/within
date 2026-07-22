'use client';
import React, { useState } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { CheckCircle, Clock, XCircle, AlertTriangle, Eye, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

const mockSubscriptions = [
  { id: '1', business: 'Padaria Sao Joao', plan: 'professional', status: 'active', mrr: 599, nextBilling: '2026-08-01', startDate: '2026-01-15' },
  { id: '2', business: 'Fresh Cuts Butchery', plan: 'starter', status: 'trial', mrr: 0, nextBilling: '2026-07-24', startDate: '2026-07-10' },
  { id: '3', business: 'Café Lisboa', plan: 'starter', status: 'expired', mrr: 0, nextBilling: '-', startDate: '2026-03-20' },
  { id: '4', business: 'Distribuidora Norte', plan: 'enterprise', status: 'active', mrr: 1299, nextBilling: '2026-08-01', startDate: '2025-11-01' },
  { id: '5', business: 'Restaurante Bom Sabor', plan: 'professional', status: 'suspended', mrr: 0, nextBilling: '-', startDate: '2026-02-28' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-success/10 text-success', icon: <CheckCircle size={12} /> },
  trial: { label: 'Trial', color: 'bg-info/10 text-info', icon: <Clock size={12} /> },
  expired: { label: 'Expired', color: 'bg-danger/10 text-danger', icon: <XCircle size={12} /> },
  suspended: { label: 'Suspended', color: 'bg-warning/10 text-warning', icon: <AlertTriangle size={12} /> },
};

export default function SuperAdminSubscriptionsPage() {
  const [selected, setSelected] = useState<typeof mockSubscriptions[0] | null>(null);

  const totalMRR = mockSubscriptions.reduce((sum, s) => sum + s.mrr, 0);

  return (
    <SuperAdminLayout adminName="Ricardo Alves" suspendedCount={2} expiringCount={5}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform subscription management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total MRR', value: `R ${totalMRR.toLocaleString()}`, color: 'text-success', icon: TrendingUp },
            { label: 'Active', value: mockSubscriptions.filter(s => s.status === 'active').length, color: 'text-success', icon: CheckCircle },
            { label: 'Trial', value: mockSubscriptions.filter(s => s.status === 'trial').length, color: 'text-info', icon: Clock },
            { label: 'Expired/Suspended', value: mockSubscriptions.filter(s => ['expired','suspended'].includes(s.status)).length, color: 'text-danger', icon: XCircle },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} className={s.color} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Business</th>
                  <th className="table-header hidden sm:table-cell">Plan</th>
                  <th className="table-header hidden md:table-cell">MRR</th>
                  <th className="table-header hidden lg:table-cell">Next Billing</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockSubscriptions.map((sub) => {
                  const status = statusConfig[sub.status];
                  return (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-foreground text-sm">{sub.business}</p>
                        <p className="text-xs text-muted-foreground">Since {sub.startDate}</p>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="badge-base bg-primary/10 text-primary text-xs capitalize">{sub.plan}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="font-semibold text-foreground">R {sub.mrr.toLocaleString()}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm text-foreground">{sub.nextBilling}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs flex items-center gap-1 w-fit ${status.color}`}>
                          {status.icon}{status.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelected(sub)}
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

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-6">{selected.business}</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
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
                  <span className={`badge-base text-xs capitalize ${statusConfig[selected.status].color}`}>{selected.status}</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Next Billing</p>
                  <p className="text-sm font-bold text-foreground">{selected.nextBilling}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 text-sm">Change Plan</button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
