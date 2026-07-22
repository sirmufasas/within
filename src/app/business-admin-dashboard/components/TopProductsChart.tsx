'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Sourdough', sales: 162, revenue: 486 },
  { name: 'Croissants', sales: 124, revenue: 372 },
  { name: 'Bolo Rei', sales: 98, revenue: 294 },
  { name: 'Pão Alentejano', sales: 82, revenue: 248 },
  { name: 'Pastel Nata', sales: 70, revenue: 210 },
  { name: 'Broa Milho', sales: 54, revenue: 164 },
];

const barColors = ['var(--primary)', '#6366F1', '#818CF8', '#A5B4FC', 'var(--accent)', '#7DD3FC'];

interface ProductDataPoint {
  name: string;
  sales: number;
  revenue: number;
}

interface TopProductsChartProps {
  onDataPointClick?: (data: ProductDataPoint) => void;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground mt-1">
        Revenue: <span className="font-semibold text-foreground tabular-nums">R {payload[0].value}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">Click for details</p>
    </div>
  );
}

export default function TopProductsChart({ onDataPointClick }: TopProductsChartProps) {
  const handleClick = (barData: any) => {
    if (barData?.activePayload?.[0]?.payload) {
      onDataPointClick?.(barData.activePayload[0].payload);
    }
  };

  return (
    <div className="card-base p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Top Products</h3>
        <p className="text-xs text-muted-foreground">By revenue this month · Click a bar for details</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }} onClick={handleClick} style={{ cursor: 'pointer' }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${v}`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((_, index) => (
              <Cell key={`cell-product-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}