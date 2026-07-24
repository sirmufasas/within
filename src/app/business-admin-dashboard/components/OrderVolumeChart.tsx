'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: '07/07', orders: 28, delivered: 25, revenue: 840 },
  { day: '08/07', orders: 35, delivered: 31, revenue: 1050 },
  { day: '09/07', orders: 22, delivered: 20, revenue: 660 },
  { day: '10/07', orders: 41, delivered: 38, revenue: 1230 },
  { day: '11/07', orders: 38, delivered: 34, revenue: 1140 },
  { day: '12/07', orders: 46, delivered: 42, revenue: 1380 },
  { day: '13/07', orders: 52, delivered: 48, revenue: 1560 },
  { day: '14/07', orders: 31, delivered: 28, revenue: 930 },
  { day: '15/07', orders: 29, delivered: 25, revenue: 870 },
  { day: '16/07', orders: 44, delivered: 39, revenue: 1320 },
  { day: '17/07', orders: 37, delivered: 33, revenue: 1110 },
  { day: '18/07', orders: 48, delivered: 44, revenue: 1440 },
  { day: '19/07', orders: 42, delivered: 38, revenue: 1260 },
  { day: '20/07', orders: 34, delivered: 27, revenue: 1020 },
];

interface DataPoint {
  day: string;
  orders: number;
  revenue: number;
}

interface OrderVolumeChartProps {
  onDataPointClick?: (data: DataPoint) => void;
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

export default function OrderVolumeChart({ onDataPointClick }: OrderVolumeChartProps) {
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