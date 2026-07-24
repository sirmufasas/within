'use client';
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const data = [
  { month: 'Dec', mrr: 11200, businesses: 194 },
  { month: 'Jan', mrr: 12480, businesses: 207 },
  { month: 'Feb', mrr: 13100, businesses: 214 },
  { month: 'Mar', mrr: 13850, businesses: 219 },
  { month: 'Apr', mrr: 14920, businesses: 226 },
  { month: 'May', mrr: 15640, businesses: 231 },
  { month: 'Jun', mrr: 16580, businesses: 238 },
  { month: 'Jul', mrr: 18420, businesses: 247 },
];

interface DataPoint {
  month: string;
  mrr: number;
  businesses: number;
}

interface MRRTrendChartProps {
  onDataPointClick?: (data: DataPoint) => void;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label} 2026</p>
      {payload.map((p) => (
        <div key={`mrr-tooltip-${p.name}`} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name === 'mrr' ? 'MRR' : 'Businesses'}:</span>
          <span className="font-semibold text-foreground tabular-nums">
            {p.name === 'mrr' ? `R ${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-1">Click for details</p>
    </div>
  );
}

export default function MRRTrendChart({ onDataPointClick }: MRRTrendChartProps) {
  const handleClick = (chartData: any) => {
    if (chartData?.activePayload?.[0]?.payload) {
      onDataPointClick?.(chartData.activePayload[0].payload);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} onClick={handleClick} style={{ cursor: 'pointer' }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} width={44} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={18000} stroke="var(--success)" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Target', position: 'right', fontSize: 10, fill: 'var(--success)' }} />
        <Line type="monotone" dataKey="mrr" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--primary)', cursor: 'pointer' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}