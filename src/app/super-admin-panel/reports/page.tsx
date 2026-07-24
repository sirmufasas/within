'use client';
import React, { useState } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const dynamic = 'force-dynamic';

const revenueData = [
  { month: 'Jan', mrr: 1200, businesses: 3 },
  { month: 'Feb', mrr: 1800, businesses: 4 },
  { month: 'Mar', mrr: 2400, businesses: 5 },
  { month: 'Apr', mrr: 2400, businesses: 5 },
  { month: 'May', mrr: 3000, businesses: 6 },
  { month: 'Jun', mrr: 3600, businesses: 7 },
  { month: 'Jul', mrr: 1898, businesses: 5 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span style={{ color: p.color }}>●</span> {p.name}: <span className="font-semibold text-foreground">
            {p.name === 'mrr' ? `R ${p.value.toLocaleString()}` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function SuperAdminReportsPage() {
  const [selectedBar, setSelectedBar] = useState<typeof revenueData[0] | null>(null);

  return (
    <SuperAdminLayout adminName="Ricardo Alves" suspendedCount={2} expiringCount={5}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide revenue analytics</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total MRR', value: 'R 1,898', change: '+18%' },
            { label: 'ARR', value: 'R 22,776', change: '+18%' },
            { label: 'Active Businesses', value: '2', change: '+1' },
            { label: 'Avg Revenue/Business', value: 'R 949', change: '+5%' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-success mt-1">{s.change} vs last month</p>
            </div>
          ))}
        </div>

        <div className="card-base p-5">
          <h3 className="font-semibold text-foreground mb-2">MRR Growth</h3>
          <p className="text-xs text-muted-foreground mb-4">Click a bar to see monthly breakdown</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} onClick={(data) => data?.activePayload && setSelectedBar(data.activePayload[0]?.payload)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mrr" fill="#4F46E5" radius={[4, 4, 0, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {selectedBar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedBar(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-6">{selectedBar.month} — Platform Revenue</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">MRR</p>
                  <p className="text-2xl font-bold text-primary">R {selectedBar.mrr.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Active Businesses</p>
                  <p className="text-2xl font-bold text-foreground">{selectedBar.businesses}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBar(null)} className="btn-primary w-full text-sm">Close</button>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
