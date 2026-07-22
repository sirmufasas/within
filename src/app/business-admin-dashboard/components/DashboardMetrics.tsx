import React from 'react';
import {
  ShoppingCart, Clock, Euro, AlertTriangle,
  Users, Truck,
} from 'lucide-react';

const metrics = [
  {
    id: 'metric-orders-today',
    label: 'Orders Today',
    value: '34',
    change: '+8 vs yesterday',
    changeType: 'positive',
    icon: ShoppingCart,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    id: 'metric-pending',
    label: 'Pending Orders',
    value: '7',
    change: 'Need confirmation',
    changeType: 'warning',
    icon: Clock,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    alert: true,
  },
  {
    id: 'metric-revenue',
    label: "Today\'s Revenue",
    value: '€1,284',
    change: '+€210 vs yesterday',
    changeType: 'positive',
    icon: Euro,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  {
    id: 'metric-stock-alerts',
    label: 'Stock Alerts',
    value: '4',
    change: '2 items out of stock',
    changeType: 'danger',
    icon: AlertTriangle,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    alert: true,
  },
  {
    id: 'metric-customers',
    label: 'Customers',
    value: '312',
    change: '+5 this week',
    changeType: 'positive',
    icon: Users,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    id: 'metric-deliveries',
    label: 'Deliveries Out',
    value: '11',
    change: '3 arriving soon',
    changeType: 'info',
    icon: Truck,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
];

const changeColors = {
  positive: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-accent',
  neutral: 'text-muted-foreground',
};

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`card-base p-4 sm:p-5 ${metric.alert ? 'border-warning/40 bg-warning/5' : ''} hover:shadow-card-hover transition-shadow duration-200`}
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
        </div>
      ))}
    </div>
  );
}