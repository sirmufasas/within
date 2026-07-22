'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, FileText, FileSpreadsheet, Download } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 12400, orders: 142 },
  { month: 'Feb', revenue: 14200, orders: 168 },
  { month: 'Mar', revenue: 13800, orders: 155 },
  { month: 'Apr', revenue: 16500, orders: 192 },
  { month: 'May', revenue: 18200, orders: 215 },
  { month: 'Jun', revenue: 17600, orders: 208 },
  { month: 'Jul', revenue: 19800, orders: 238 },
];

const topProducts = [
  { name: 'Pão de Forma', sales: 1240, revenue: 1488 },
  { name: 'Croissant', sales: 980, revenue: 1470 },
  { name: 'Baguette', sales: 860, revenue: 688 },
  { name: 'Bolo de Arroz', sales: 720, revenue: 1080 },
  { name: 'Farinha T65', sales: 540, revenue: 648 },
];

const customerData = [
  { name: 'Café Central', value: 28 },
  { name: 'Padaria Estrela', value: 22 },
  { name: 'Supermercado Sol', value: 18 },
  { name: 'Others', value: 32 },
];

const COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#C7D2FE'];

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
            {p.name === 'revenue' ? `R ${p.value.toLocaleString()}` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders'>('revenue');
  const [selectedBar, setSelectedBar] = useState<typeof revenueData[0] | null>(null);
  const [exporting, setExporting] = useState(false);

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
        body: revenueData.map(r => [r.month, r.revenue.toLocaleString(), r.orders]),
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
        body: topProducts.map(p => [p.name, p.sales, p.revenue.toLocaleString()]),
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
      });

      doc.save('within-report.pdf');
    } catch (e) {
      console.error('PDF export failed', e);
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
        revenueData.map(r => ({ Month: r.month, 'Revenue (R)': r.revenue, Orders: r.orders }))
      );
      XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue & Orders');

      const productsSheet = XLSX.utils.json_to_sheet(
        topProducts.map(p => ({ Product: p.name, 'Units Sold': p.sales, 'Revenue (R)': p.revenue }))
      );
      XLSX.utils.book_append_sheet(wb, productsSheet, 'Top Products');

      const customerSheet = XLSX.utils.json_to_sheet(
        customerData.map(c => ({ Customer: c.name, 'Revenue Share (%)': c.value }))
      );
      XLSX.utils.book_append_sheet(wb, customerSheet, 'Customer Distribution');

      XLSX.writeFile(wb, 'within-report.xlsx');
    } catch (e) {
      console.error('Excel export failed', e);
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
            <select className="input-field w-36 text-sm py-2.5">
              <option>This Year</option>
              <option>Last 6 Months</option>
              <option>This Month</option>
            </select>
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <FileText size={15} />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={exportExcel}
              disabled={exporting}
              className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: 'R 112,500', change: '+18%', icon: DollarSign, color: 'text-success' },
            { label: 'Total Orders', value: '1,318', change: '+12%', icon: ShoppingCart, color: 'text-primary' },
            { label: 'Avg Order Value', value: 'R 85.35', change: '+5%', icon: TrendingUp, color: 'text-foreground' },
            { label: 'Active Customers', value: '5', change: '+2', icon: Users, color: 'text-foreground' },
          ].map((kpi, i) => (
            <div key={i} className="card-base p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-success mt-1">{kpi.change} vs last period</p>
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
          <p className="text-xs text-muted-foreground mb-4">Click a bar to see monthly details</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} onClick={(data) => data?.activePayload && setSelectedBar(data.activePayload[0]?.payload)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={activeChart}
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Top Products by Sales</h3>
              <button
                onClick={exportExcel}
                disabled={exporting}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-60"
              >
                <Download size={13} /> Export
              </button>
            </div>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-sm font-semibold text-foreground">{p.sales} units</p>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full within-gradient rounded-full"
                        style={{ width: `${(p.sales / topProducts[0].sales) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="card-base p-5">
            <h3 className="font-semibold text-foreground mb-4">Revenue by Customer</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    cursor="pointer"
                  >
                    {customerData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {customerData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <p className="text-xs text-foreground flex-1 truncate">{item.name}</p>
                    <p className="text-xs font-semibold text-foreground">{item.value}%</p>
                  </div>
                ))}
              </div>
            </div>
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
                  <p className="text-2xl font-bold text-foreground">R {(selectedBar.revenue / selectedBar.orders).toFixed(2)}</p>
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
