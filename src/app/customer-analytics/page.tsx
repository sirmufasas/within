'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, TrendingUp, ShoppingCart, Star, ArrowUp, ArrowDown,
  Calendar, Award, ChevronDown,
} from 'lucide-react';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const orderFrequencyData = [
  { month: 'Feb', newCustomers: 8, returning: 22, churned: 3 },
  { month: 'Mar', newCustomers: 12, returning: 28, churned: 2 },
  { month: 'Apr', newCustomers: 10, returning: 31, churned: 4 },
  { month: 'May', newCustomers: 15, returning: 35, churned: 1 },
  { month: 'Jun', newCustomers: 9, returning: 38, churned: 3 },
  { month: 'Jul', newCustomers: 18, returning: 42, churned: 2 },
];

const spendingTrendData = [
  { month: 'Feb', avgOrderValue: 145, totalRevenue: 3800 },
  { month: 'Mar', avgOrderValue: 162, totalRevenue: 5200 },
  { month: 'Apr', avgOrderValue: 158, totalRevenue: 4900 },
  { month: 'May', avgOrderValue: 175, totalRevenue: 6300 },
  { month: 'Jun', avgOrderValue: 189, totalRevenue: 7100 },
  { month: 'Jul', avgOrderValue: 210, totalRevenue: 8900 },
];

const segmentData = [
  { name: 'Champions', value: 8, description: 'High frequency, high spend' },
  { name: 'Loyal', value: 14, description: 'Regular orders, consistent spend' },
  { name: 'At Risk', value: 6, description: 'Declining order frequency' },
  { name: 'New', value: 18, description: 'First or second order' },
  { name: 'Dormant', value: 4, description: 'No orders in 60+ days' },
];

const topCustomers = [
  { rank: 1, name: 'Café Central', orders: 48, totalSpend: 11760, avgOrder: 245, growth: 12, lastOrder: '2026-07-22' },
  { rank: 2, name: 'Padaria Estrela', orders: 36, totalSpend: 18432, avgOrder: 512, growth: 8, lastOrder: '2026-07-22' },
  { rank: 3, name: 'Supermercado Sol', orders: 24, totalSpend: 18360, avgOrder: 765, growth: -3, lastOrder: '2026-07-21' },
  { rank: 4, name: 'Restaurante O Forno', orders: 30, totalSpend: 5670, avgOrder: 189, growth: 22, lastOrder: '2026-07-22' },
  { rank: 5, name: 'Hotel Lisboa', orders: 18, totalSpend: 1611, avgOrder: 89.5, growth: 5, lastOrder: '2026-07-21' },
];

const orderFreqBuckets = [
  { label: '1 order', count: 18, pct: 36 },
  { label: '2–5 orders', count: 14, pct: 28 },
  { label: '6–10 orders', count: 10, pct: 20 },
  { label: '11–20 orders', count: 5, pct: 10 },
  { label: '20+ orders', count: 3, pct: 6 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">{typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') ? `R ${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function CustomerAnalyticsPage() {
  const [period, setPeriod] = useState('6m');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const totalCustomers = segmentData.reduce((s, d) => s + d.value, 0);
  const retentionRate = Math.round(((totalCustomers - segmentData.find(s => s.name === 'Dormant')!.value) / totalCustomers) * 100);

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Behaviour insights, spending trends, and top customers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input-base text-sm pr-8 appearance-none"
              >
                <option value="1m">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Customers', value: totalCustomers, icon: <Users size={20} />, color: 'text-primary', bg: 'bg-primary/10', change: '+18%', up: true },
            { label: 'Retention Rate', value: `${retentionRate}%`, icon: <Star size={20} />, color: 'text-success', bg: 'bg-success/10', change: '+3%', up: true },
            { label: 'Avg Order Value', value: 'R 210', icon: <ShoppingCart size={20} />, color: 'text-warning', bg: 'bg-warning/10', change: '+11%', up: true },
            { label: 'Repeat Rate', value: '64%', icon: <TrendingUp size={20} />, color: 'text-info', bg: 'bg-info/10', change: '-2%', up: false },
          ].map((card) => (
            <div key={card.label} className="card-base p-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${card.up ? 'text-success' : 'text-danger'}`}>
                {card.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {card.change} vs last period
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Activity */}
          <div className="card-base p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Customer Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">New, returning, and churned customers per month</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderFrequencyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="newCustomers" name="New" fill={COLORS[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="returning" name="Returning" fill={COLORS[2]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill={COLORS[3]} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spending Trend */}
          <div className="card-base p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Spending Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Average order value and total revenue over time</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={spendingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="avgOrderValue" name="Avg Order (R)" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="totalRevenue" name="Revenue (R)" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Segments */}
          <div className="card-base p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Customer Segments</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click a segment to filter</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  onClick={(d) => setSelectedSegment(selectedSegment === d.name ? null : d.name)}
                >
                  {segmentData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                      opacity={selectedSegment && selectedSegment !== entry.name ? 0.4 : 1}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} customers`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {segmentData.map((seg, i) => (
                <button
                  key={seg.name}
                  onClick={() => setSelectedSegment(selectedSegment === seg.name ? null : seg.name)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                    selectedSegment === seg.name ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-medium text-foreground flex-1">{seg.name}</span>
                  <span className="text-xs text-muted-foreground">{seg.value}</span>
                </button>
              ))}
            </div>
            {selectedSegment && (
              <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedSegment}:</span>{' '}
                  {segmentData.find(s => s.name === selectedSegment)?.description}
                </p>
              </div>
            )}
          </div>

          {/* Order Frequency Distribution */}
          <div className="card-base p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Order Frequency</h3>
              <p className="text-xs text-muted-foreground mt-0.5">How often customers reorder</p>
            </div>
            <div className="space-y-3">
              {orderFreqBuckets.map((bucket) => (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{bucket.label}</span>
                    <span className="text-xs font-semibold text-foreground">{bucket.count} customers</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full within-gradient rounded-full transition-all duration-700"
                      style={{ width: `${bucket.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{bucket.pct}% of base</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="card-base p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Quick Insights</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Key observations this period</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: <TrendingUp size={14} />, color: 'text-success bg-success/10', text: 'Revenue per customer up 11% — driven by Padaria Estrela and Supermercado Sol.' },
                { icon: <Users size={14} />, color: 'text-primary bg-primary/10', text: '18 new customers acquired this month — highest in 6 months.' },
                { icon: <Star size={14} />, color: 'text-warning bg-warning/10', text: '8 champion customers account for 62% of total revenue.' },
                { icon: <Calendar size={14} />, color: 'text-info bg-info/10', text: 'Tuesday and Thursday are peak order days — consider promotions on slow days.' },
                { icon: <Award size={14} />, color: 'text-success bg-success/10', text: 'Café Central placed 48 orders — most loyal customer this period.' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.color}`}>
                    {insight.icon}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="card-base overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Top Customers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ranked by total spend this period</p>
            </div>
            <a href="/customers" className="text-xs text-primary font-medium hover:underline">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Customer</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">Orders</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">Total Spend</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">Avg Order</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">Growth</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c) => (
                  <tr key={c.rank} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        c.rank === 1 ? 'bg-warning/20 text-warning' :
                        c.rank === 2 ? 'bg-muted text-muted-foreground' :
                        c.rank === 3 ? 'bg-orange-100 text-orange-600': 'bg-muted text-muted-foreground'
                      }`}>
                        {c.rank}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 within-gradient rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-foreground">{c.orders}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-foreground">R {c.totalSpend.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-muted-foreground">R {c.avgOrder}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`flex items-center justify-end gap-1 text-xs font-medium ${c.growth >= 0 ? 'text-success' : 'text-danger'}`}>
                        {c.growth >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                        {Math.abs(c.growth)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
