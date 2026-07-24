'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#C7D2FE', '#A5B4FC'];

type Period = 'this-month' | 'last-6-months' | 'this-year';

interface RawItemRow {
  quantity: number;
  unit_price: number | null;
  product_id: string | null;
  products: { name: string; selling_price: number | null } | null;
  order_submissions: {
    id: string;
    for_date: string;
    customer_id: string;
    customers: { name: string } | null;
  } | null;
}

interface MonthPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface ProductStat {
  name: string;
  units: number;
  revenue: number;
}

interface CustomerStat {
  name: string;
  revenue: number;
}

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
          <span style={{ color: p.color }}>●</span> {p.name}:{' '}
          <span className="font-semibold text-foreground">
            {p.name === 'revenue' ? `R ${p.value.toLocaleString()}` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

function periodStartDate(period: Period): Date {
  const now = new Date();
  if (period === 'this-month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'last-6-months') return new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return new Date(now.getFullYear(), 0, 1);
}

export default function ReportsPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [period, setPeriod] = useState<Period>('this-year');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RawItemRow[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders'>('revenue');
  const [selectedBar, setSelectedBar] = useState<MonthPoint | null>(null);
  const [exporting, setExporting] = useState(false);
  const [hasPricing, setHasPricing] = useState(true);

  const loadData = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const startDate = periodStartDate(period).toISOString().slice(0, 10);

      const [itemsRes, customersRes] = await Promise.all([
        supabase
          .from('order_submission_items')
          .select(`
            quantity,
            unit_price,
            product_id,
            products ( name, selling_price ),
            order_submissions!inner (
              id,
              for_date,
              customer_id,
              business_id,
              customers ( name )
            )
          `)
          .eq('order_submissions.business_id', business.id)
          .gte('order_submissions.for_date', startDate),
        supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (customersRes.error) throw customersRes.error;

      setRows((itemsRes.data as unknown as RawItemRow[]) || []);
      setCustomerCount(customersRes.count || 0);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [business?.id, period, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Whether any line item in the dataset has no resolvable price (no stored unit_price and no current product price)
  useEffect(() => {
    if (rows.length > 0) {
      setHasPricing(rows.every((r) => (r.unit_price && r.unit_price > 0) || r.products?.selling_price != null));
    }
  }, [rows]);

  const lineRevenue = (row: RawItemRow) => {
    const price = row.unit_price && row.unit_price > 0 ? row.unit_price : (row.products?.selling_price || 0);
    return price * row.quantity;
  };

  const monthly: MonthPoint[] = useMemo(() => {
    const map = new Map<string, { revenue: number; orderIds: Set<string> }>();
    rows.forEach((row) => {
      const sub = row.order_submissions;
      if (!sub) return;
      const d = new Date(sub.for_date);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (!map.has(key)) map.set(key, { revenue: 0, orderIds: new Set() });
      const entry = map.get(key)!;
      entry.revenue += lineRevenue(row);
      entry.orderIds.add(sub.id);
    });
    return Array.from(map.entries())
      .map(([month, v]) => ({ month, revenue: Math.round(v.revenue * 100) / 100, orders: v.orderIds.size }))
      .sort((a, b) => new Date(`1 ${a.month}`).getTime() - new Date(`1 ${b.month}`).getTime());
  }, [rows]);

  const topProducts: ProductStat[] = useMemo(() => {
    const map = new Map<string, ProductStat>();
    rows.forEach((row) => {
      const name = row.products?.name || 'Unknown product';
      if (!map.has(name)) map.set(name, { name, units: 0, revenue: 0 });
      const entry = map.get(name)!;
      entry.units += row.quantity;
      entry.revenue += lineRevenue(row);
    });
    return Array.from(map.values()).sort((a, b) => b.units - a.units).slice(0, 5);
  }, [rows]);

  const customerDistribution: CustomerStat[] = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row) => {
      const name = row.order_submissions?.customers?.name || 'Unknown customer';
      map.set(name, (map.get(name) || 0) + lineRevenue(row));
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    const rest = sorted.slice(4).reduce((sum, [, v]) => sum + v, 0);
    const totalRevenue = sorted.reduce((sum, [, v]) => sum + v, 0) || 1;
    const result: CustomerStat[] = top.map(([name, v]) => ({ name, revenue: Math.round((v / totalRevenue) * 1000) / 10 }));
    if (rest > 0) result.push({ name: 'Others', revenue: Math.round((rest / totalRevenue) * 1000) / 10 });
    return result;
  }, [rows]);

  const totalRevenue = useMemo(() => rows.reduce((sum, r) => sum + lineRevenue(r), 0), [rows]);
  const totalOrders = useMemo(() => new Set(rows.map((r) => r.order_submissions?.id).filter(Boolean)).size, [rows]);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const exportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229);
      doc.text('WITH-IN — Business Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 28);

      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text('Revenue & Orders Summary', 14, 40);

      autoTable(doc, {
        startY: 45,
        head: [['Month', 'Revenue (R)', 'Orders']],
        body: monthly.map((r) => [r.month, r.revenue.toLocaleString(), r.orders]),
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
      });

      const afterRevenue = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text('Top Products', 14, afterRevenue);

      autoTable(doc, {
        startY: afterRevenue + 5,
        head: [['Product', 'Units Sold', 'Revenue (R)']],
        body: topProducts.map((p) => [p.name, p.units, p.revenue.toLocaleString()]),
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
      });

      doc.save('within-report.pdf');
    } catch (e) {
      console.error('PDF export failed', e);
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const revenueSheet = XLSX.utils.json_to_sheet(
        monthly.map((r) => ({ Month: r.month, 'Revenue (R)': r.revenue, Orders: r.orders }))
      );
      XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue & Orders');

      const productsSheet = XLSX.utils.json_to_sheet(
        topProducts.map((p) => ({ Product: p.name, 'Units Sold': p.units, 'Revenue (R)': p.revenue }))
      );
      XLSX.utils.book_append_sheet(wb, productsSheet, 'Top Products');

      const customerSheet = XLSX.utils.json_to_sheet(
        customerDistribution.map((c) => ({ Customer: c.name, 'Revenue Share (%)': c.revenue }))
      );
      XLSX.utils.book_append_sheet(wb, customerSheet, 'Customer Distribution');

      XLSX.writeFile(wb, 'within-report.xlsx');
    } catch (e) {
      console.error('Excel export failed', e);
      toast.error('Excel export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Business performance overview</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="input-field w-36 text-sm py-2.5"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              <option value="this-year">This Year</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-month">This Month</option>
            </select>
            <button onClick={exportPDF} disabled={exporting || loading} className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-60">
              <FileText size={15} />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button onClick={exportExcel} disabled={exporting || loading} className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-60">
              <FileSpreadsheet size={15} />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>

        {!loading && !hasPricing && (
          <div className="card-base p-4 bg-warning/10 border-warning/30 text-sm text-foreground">
            Some products in this period don&apos;t have a selling price set, so revenue figures below are
            underestimated. Add prices under Products to get accurate numbers.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `R ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-success' },
            { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-primary' },
            { label: 'Avg Order Value', value: `R ${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-foreground' },
            { label: 'Total Customers', value: customerCount.toLocaleString(), icon: Users, color: 'text-foreground' },
          ].map((kpi) => (
            <div key={kpi.label} className="card-base p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <p className={`text-xl font-bold ${kpi.color}`}>{loading ? '—' : kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Revenue & Orders Trend</h3>
            <div className="flex gap-2">
              {(['revenue', 'orders'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveChart(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeChart === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-[280px] skeleton-wave rounded-lg" />
          ) : monthly.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
              No orders in this period yet
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">Click a bar to see monthly details</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthly} onClick={(data) => data?.activePayload && setSelectedBar(data.activePayload[0]?.payload)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey={activeChart} fill="#4F46E5" radius={[4, 4, 0, 0]} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Top Products by Sales</h3>
              <button onClick={exportExcel} disabled={exporting || loading} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-60">
                <Download size={13} /> Export
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-8 skeleton-wave rounded-lg" />)}</div>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No product sales yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-sm font-semibold text-foreground">{p.units} units</p>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full within-gradient rounded-full" style={{ width: `${(p.units / topProducts[0].units) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Distribution */}
          <div className="card-base p-5">
            <h3 className="font-semibold text-foreground mb-4">Revenue by Customer</h3>
            {loading ? (
              <div className="h-[180px] skeleton-wave rounded-lg" />
            ) : customerDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No customer revenue yet</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={customerDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="revenue" cursor="pointer">
                      {customerDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {customerDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <p className="text-xs text-foreground flex-1 truncate">{item.name}</p>
                      <p className="text-xs font-semibold text-foreground">{item.revenue}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Detail Modal */}
        {selectedBar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedBar(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-6">{selectedBar.month} — Monthly Details</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-primary">R {selectedBar.revenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Orders</p>
                  <p className="text-2xl font-bold text-foreground">{selectedBar.orders}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl text-center col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    R {selectedBar.orders > 0 ? (selectedBar.revenue / selectedBar.orders).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedBar(null)} className="btn-primary w-full text-sm">Close</button>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
