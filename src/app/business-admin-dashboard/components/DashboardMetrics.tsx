import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Clock, Euro, AlertTriangle,
  Users, Truck,
} from 'lucide-react';

export interface DashboardMetricsData {
  ordersToday: number;
  ordersYesterday: number;
  pendingOrders: number;
  revenueToday: number;
  revenueYesterday: number;
  stockAlerts: number;
  outOfStockCount: number;
  totalCustomers: number;
  newCustomersThisWeek: number;
  activeDeliveries: number;
}

const changeColors = {
  positive: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-accent',
  neutral: 'text-muted-foreground',
};

export default function DashboardMetrics({ data }: { data: DashboardMetricsData }) {
  const orderDiff = data.ordersToday - data.ordersYesterday;
  const revenueDiff = data.revenueToday - data.revenueYesterday;

  const metrics = [
    {
      id: 'metric-orders-today',
      label: 'Orders Today',
      value: String(data.ordersToday),
      change: orderDiff === 0 ? 'Same as yesterday' : `${orderDiff > 0 ? '+' : ''}${orderDiff} vs yesterday`,
      changeType: orderDiff >= 0 ? 'positive' : 'danger',
      icon: ShoppingCart, iconBg: 'bg-primary/10', iconColor: 'text-primary', href: '/orders',
    },
    {
      id: 'metric-pending',
      label: 'Pending Orders',
      value: String(data.pendingOrders),
      change: data.pendingOrders > 0 ? 'Need confirmation' : 'All caught up',
      changeType: data.pendingOrders > 0 ? 'warning' : 'positive',
      icon: Clock, iconBg: 'bg-warning/10', iconColor: 'text-warning', alert: data.pendingOrders > 0, href: '/orders',
    },
    {
      id: 'metric-revenue',
      label: "Today's Revenue",
      value: `R ${data.revenueToday.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: revenueDiff === 0 ? 'Same as yesterday' : `${revenueDiff > 0 ? '+' : ''}R ${revenueDiff.toFixed(0)} vs yesterday`,
      changeType: revenueDiff >= 0 ? 'positive' : 'danger',
      icon: Euro, iconBg: 'bg-success/10', iconColor: 'text-success', href: '/reports',
    },
    {
      id: 'metric-stock-alerts',
      label: 'Stock Alerts',
      value: String(data.stockAlerts),
      change: data.outOfStockCount > 0 ? `${data.outOfStockCount} out of stock` : 'All above minimum',
      changeType: data.stockAlerts > 0 ? 'danger' : 'positive',
      icon: AlertTriangle, iconBg: 'bg-danger/10', iconColor: 'text-danger', alert: data.stockAlerts > 0, href: '/inventory',
    },
    {
      id: 'metric-customers',
      label: 'Customers',
      value: String(data.totalCustomers),
      change: data.newCustomersThisWeek > 0 ? `+${data.newCustomersThisWeek} this week` : 'No new this week',
      changeType: 'positive',
      icon: Users, iconBg: 'bg-accent/10', iconColor: 'text-accent', href: '/customers',
    },
    {
      id: 'metric-deliveries',
      label: 'Deliveries Out',
      value: String(data.activeDeliveries),
      change: data.activeDeliveries > 0 ? 'In progress' : 'None right now',
      changeType: 'info',
      icon: Truck, iconBg: 'bg-violet-100', iconColor: 'text-violet-600', href: '/drivers',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {metrics.map((metric) => (
        <Link
          key={metric.id}
          href={metric.href}
          className={`card-base p-4 sm:p-5 ${'alert' in metric && metric.alert ? 'border-warning/40 bg-warning/5' : ''} hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02] cursor-pointer block`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{metric.label}</p>
            <div className={`w-9 h-9 rounded-xl ${metric.iconBg} flex items-center justify-center flex-shrink-0`}>
              <metric.icon size={18} className={metric.iconColor} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{metric.value}</p>
          <p className={`text-xs mt-1.5 font-medium ${changeColors[metric.changeType as keyof typeof changeColors]}`}>
            {metric.change}
          </p>
        </Link>
      ))}
    </div>
  );
}