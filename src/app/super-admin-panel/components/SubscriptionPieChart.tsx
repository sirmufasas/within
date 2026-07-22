'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer,  } from 'recharts';

const data = [
  { name: 'Starter', value: 98, color: '#818CF8' },
  { name: 'Growth', value: 112, color: 'var(--primary)' },
  { name: 'Pro', value: 37, color: '#312E81' },
  { name: 'Trial', value: 31, color: 'var(--accent)' },
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const item = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg shadow-modal p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="font-semibold text-foreground">{item.name} Plan</span>
      </div>
      <p className="text-muted-foreground">
        Businesses: <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
      </p>
      <p className="text-muted-foreground">
        Share: <span className="font-semibold text-foreground tabular-nums">{((item.value / total) * 100).toFixed(1)}%</span>
      </p>
    </div>
  );
}

function CustomLegend() {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {data.map((entry) => (
        <div key={`legend-${entry.name}`} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{entry.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {entry.value} · {((entry.value / total) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SubscriptionPieChart() {
  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  );
}