'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface OrderVolumePoint {
  day: string;
  orders: number;
  delivered: number;
  revenue: number;
}

interface OrderVolumeChartProps {
  data: OrderVolumePoint[];
  onDataPointClick?: (data: OrderVolumePoint) => void;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tooltip-${p.name}`} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-1">Click to see details</p>
    </div>
  );
}

export default function OrderVolumeChart({ data, onDataPointClick }: OrderVolumeChartProps) {
  const handleClick = (chartData: any) => {
    if (chartData?.activePayload?.[0]?.payload) {
      onDataPointClick?.(chartData.activePayload[0].payload);
    }
  };

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Order Volume</h3>
          <p className="text-xs text-muted-foreground">Last 14 days · Click a point for details</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span>Orders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-accent rounded" />
            <span>Delivered</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} onClick={handleClick} style={{ cursor: 'pointer' }}>
          <defs>
            <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={1} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={2} fill="url(#ordersGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--primary)', cursor: 'pointer' }} />
          <Area type="monotone" dataKey="delivered" stroke="var(--accent)" strokeWidth={2} fill="url(#deliveredGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--accent)', cursor: 'pointer' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}