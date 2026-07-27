'use client';
import React, { useCallback, useEffect, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';

import DashboardMetrics, { type DashboardMetricsData } from './components/DashboardMetrics';
import DashboardCharts from './components/DashboardCharts';
import { type OrderVolumePoint } from './components/OrderVolumeChart';
import { type ProductDataPoint } from './components/TopProductsChart';
import RecentOrdersTable, { type RecentOrder, type RealOrderStatus } from './components/RecentOrdersTable';
import StockAlertsPanel, { type StockAlertItem } from './components/StockAlertsPanel';
import ActivityFeed, { type ActivityItem } from './components/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, Package, User, Truck } from 'lucide-react';

interface RawItemRow {
  quantity: number;
  unit_price: number | null;
  products: { name: string; selling_price: number | null } | null;
  order_submissions: {
    id: string;
    for_date: string;
    status: RealOrderStatus;
    customer_id: string;
    customers: { name: string; phone: string | null } | null;
  } | null;
}

function lineRevenue(row: RawItemRow) {
  const price = row.unit_price && row.unit_price > 0 ? row.unit_price : (row.products?.selling_price || 0);
  return price * row.quantity;
}

export default function BusinessAdminDashboardPage() {
  const { business, userProfile } = useAuth();
  const supabase = createClient();
  const today = new Date()?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    ordersToday: 0, ordersYesterday: 0, pendingOrders: 0, revenueToday: 0, revenueYesterday: 0,
    stockAlerts: 0, outOfStockCount: 0, totalCustomers: 0, newCustomersThisWeek: 0, activeDeliveries: 0,
  });
  const [orderVolumeData, setOrderVolumeData] = useState<OrderVolumePoint[]>([]);
  const [topProductsData, setTopProductsData] = useState<ProductDataPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayIso = yesterday.toISOString().slice(0, 10);
      const startWindow = new Date(); startWindow.setDate(startWindow.getDate() - 31);
      const startWindowIso = startWindow.toISOString().slice(0, 10);
      const last14 = new Date(); last14.setDate(last14.getDate() - 13);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        itemsRes, pendingRes, customersRes, newCustomersRes,
        productsRes, batchesRes, deliveriesRes, movementsRes, recentOrdersRes,
      ] = await Promise.all([
        supabase.from('order_submission_items').select(`
            quantity, unit_price,
            products ( name, selling_price ),
            order_submissions!inner ( id, for_date, status, customer_id, business_id, customers ( name, phone ) )
          `).eq('order_submissions.business_id', business.id).gte('order_submissions.for_date', startWindowIso),
        supabase.from('order_submissions').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('status', 'pending'),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', weekAgo.toISOString()),
        supabase.from('products').select('id, name, reorder_level, unit').eq('business_id', business.id).eq('is_active', true),
        supabase.from('stock_batches').select('product_id, quantity').eq('business_id', business.id),
        supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('business_id', business.id).in('status', ['pending', 'in-transit']),
        supabase.from('stock_movements').select('id, movement_type, quantity, created_at, products ( name )').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('order_submissions').select(`
            id, for_date, status, created_at,
            customers ( name, phone ),
            order_submission_items ( product_name, quantity, unit_price, products ( selling_price ) )
          `).eq('business_id', business.id).order('created_at', { ascending: false }).limit(8),
      ]);

      if (itemsRes.error) throw itemsRes.error;

      const rows = (itemsRes.data as unknown as RawItemRow[]) || [];

      // --- Metrics: today / yesterday ---
      const todayRows = rows.filter((r) => r.order_submissions?.for_date === todayIso);
      const yesterdayRows = rows.filter((r) => r.order_submissions?.for_date === yesterdayIso);
      const ordersToday = new Set(todayRows.map((r) => r.order_submissions?.id)).size;
      const ordersYesterday = new Set(yesterdayRows.map((r) => r.order_submissions?.id)).size;
      const revenueToday = todayRows.reduce((s, r) => s + lineRevenue(r), 0);
      const revenueYesterday = yesterdayRows.reduce((s, r) => s + lineRevenue(r), 0);

      // --- Stock alerts (same logic as Products page) ---
      const stockByProduct = new Map<string, number>();
      (batchesRes.data || []).forEach((b: any) => {
        stockByProduct.set(b.product_id, (stockByProduct.get(b.product_id) || 0) + Number(b.quantity || 0));
      });
      const alerts: StockAlertItem[] = [];
      (productsRes.data || []).forEach((p: any) => {
        const stock = stockByProduct.get(p.id) || 0;
        const reorder = p.reorder_level || 0;
        if (stock <= 0) {
          alerts.push({ id: p.id, product: p.name, sku: '', current: `0 ${p.unit || ''}`, minimum: `${reorder} ${p.unit || ''}`, status: 'out-of-stock' });
        } else if (reorder > 0 && stock <= reorder) {
          alerts.push({ id: p.id, product: p.name, sku: '', current: `${stock} ${p.unit || ''}`, minimum: `${reorder} ${p.unit || ''}`, status: 'low-stock' });
        }
      });
      const outOfStockCount = alerts.filter((a) => a.status === 'out-of-stock').length;

      setMetrics({
        ordersToday, ordersYesterday, pendingOrders: pendingRes.count || 0,
        revenueToday, revenueYesterday,
        stockAlerts: alerts.length, outOfStockCount,
        totalCustomers: customersRes.count || 0, newCustomersThisWeek: newCustomersRes.count || 0,
        activeDeliveries: deliveriesRes.count || 0,
      });
      setStockAlerts(alerts.slice(0, 6));

      // --- Order volume chart (last 14 days) ---
      const volumeMap = new Map<string, { orders: Set<string>; delivered: Set<string>; revenue: number }>();
      rows.forEach((r) => {
        const sub = r.order_submissions;
        if (!sub || sub.for_date < last14.toISOString().slice(0, 10)) return;
        const key = sub.for_date;
        if (!volumeMap.has(key)) volumeMap.set(key, { orders: new Set(), delivered: new Set(), revenue: 0 });
        const entry = volumeMap.get(key)!;
        entry.orders.add(sub.id);
        if (sub.status === 'delivered') entry.delivered.add(sub.id);
        entry.revenue += lineRevenue(r);
      });
      const volumePoints: OrderVolumePoint[] = Array.from(volumeMap.entries())
        .map(([date, v]) => ({
          day: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
          orders: v.orders.size, delivered: v.delivered.size, revenue: Math.round(v.revenue),
        }))
        .sort((a, b) => a.day.localeCompare(b.day));
      setOrderVolumeData(volumePoints);

      // --- Top products (within fetched window) ---
      const productMap = new Map<string, ProductDataPoint>();
      rows.forEach((r) => {
        const name = r.products?.name || 'Unknown';
        if (!productMap.has(name)) productMap.set(name, { name, sales: 0, revenue: 0 });
        const entry = productMap.get(name)!;
        entry.sales += r.quantity;
        entry.revenue += lineRevenue(r);
      });
      setTopProductsData(
        Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6).map((p) => ({ ...p, revenue: Math.round(p.revenue) }))
      );

      // --- Recent orders table ---
      const recent: RecentOrder[] = (recentOrdersRes.data as any[] || []).map((o) => {
        const items = o.order_submission_items || [];
        const total = items.reduce((s: number, it: any) => {
          const price = it.unit_price && it.unit_price > 0 ? it.unit_price : (it.products?.selling_price || 0);
          return s + price * it.quantity;
        }, 0);
        return {
          id: o.id,
          orderNumber: `#${o.id.slice(0, 8).toUpperCase()}`,
          customer: o.customers?.name || 'Unknown',
          phone: o.customers?.phone || '',
          items: items.map((it: any) => it.product_name).join(', ') || 'No items',
          itemCount: items.reduce((s: number, it: any) => s + it.quantity, 0),
          total: `R ${total.toFixed(2)}`,
          status: o.status as RealOrderStatus,
          driver: null,
          placedAt: new Date(o.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          deliveryDate: o.for_date,
        };
      });
      setRecentOrders(recent);

      // --- Activity feed: recent orders + recent stock movements, merged ---
      const orderActivities: ActivityItem[] = (recentOrdersRes.data as any[] || []).slice(0, 5).map((o) => ({
        id: `order-${o.id}`,
        icon: o.status === 'cancelled' ? ShoppingCart : ShoppingCart,
        iconBg: o.status === 'cancelled' ? 'bg-danger/10' : 'bg-primary/10',
        iconColor: o.status === 'cancelled' ? 'text-danger' : 'text-primary',
        message: o.status === 'cancelled'
          ? `Order from ${o.customers?.name || 'a customer'} was cancelled`
          : `New order from ${o.customers?.name || 'a customer'}`,
        time: new Date(o.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        _ts: new Date(o.created_at).getTime(),
      })) as any;

      const movementActivities: ActivityItem[] = (movementsRes.data as any[] || []).map((m) => ({
        id: `mv-${m.id}`,
        icon: Package,
        iconBg: m.movement_type === 'expiry_write_off' ? 'bg-danger/10' : 'bg-warning/10',
        iconColor: m.movement_type === 'expiry_write_off' ? 'text-danger' : 'text-warning',
        message: `${m.products?.name || 'A product'} \u2014 ${m.movement_type.replace('_', ' ')} (${m.quantity})`,
        time: new Date(m.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        _ts: new Date(m.created_at).getTime(),
      })) as any;

      const merged = [...orderActivities, ...movementActivities]
        .sort((a: any, b: any) => b._ts - a._ts)
        .slice(0, 8)
        .map(({ _ts, ...rest }: any) => rest);
      setActivities(merged);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [business?.id, supabase]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {today} \u00b7 {business?.name || 'Your Business'}
            </p>
          </div>
          <a href="/orders" className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
            + New Order
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="card-base p-5 h-28 skeleton-wave" />)}
          </div>
        ) : (
          <DashboardMetrics data={metrics} />
        )}

        {!loading && (
          <DashboardCharts orderVolumeData={orderVolumeData} topProductsData={topProductsData} />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            {loading ? <div className="card-base h-64 skeleton-wave" /> : <RecentOrdersTable orders={recentOrders} />}
          </div>
          <div className="space-y-6">
            {loading ? <div className="card-base h-48 skeleton-wave" /> : <StockAlertsPanel alerts={stockAlerts} />}
            {loading ? <div className="card-base h-48 skeleton-wave" /> : <ActivityFeed activities={activities} />}
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
