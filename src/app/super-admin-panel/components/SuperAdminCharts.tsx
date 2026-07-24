'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const MRRTrendChart = dynamic(() => import('./MRRTrendChart'), { ssr: false });
const SubscriptionPieChart = dynamic(() => import('./SubscriptionPieChart'), { ssr: false });

interface MRRDataPoint {
  month: string;
  mrr: number;
  businesses: number;
}

export default function SuperAdminCharts() {
  const [selectedMRR, setSelectedMRR] = useState<MRRDataPoint | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">MRR Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly recurring revenue · Click a point for details</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-primary rounded" />
                <span>MRR (R)</span>
              </div>
            </div>
          </div>
          <MRRTrendChart onDataPointClick={setSelectedMRR} />
        </div>
        <div className="xl:col-span-2 card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Subscription Plans</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Active businesses by plan</p>
            </div>
          </div>
          <SubscriptionPieChart />
        </div>
      </div>

      {/* MRR Detail Modal */}
      {selectedMRR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedMRR(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-6">{selectedMRR.month} 2026 — Platform Revenue</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">MRR</p>
                <p className="text-2xl font-bold text-primary">R {selectedMRR.mrr.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Businesses</p>
                <p className="text-2xl font-bold text-foreground">{selectedMRR.businesses}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl text-center col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Avg Revenue per Business</p>
                <p className="text-2xl font-bold text-foreground">R {(selectedMRR.mrr / selectedMRR.businesses).toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => setSelectedMRR(null)} className="btn-primary w-full text-sm">Close</button>
          </div>
        </div>
      )}
    </>
  );
}