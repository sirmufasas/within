import React from 'react';
import { Building2, TrendingUp, Clock, UserMinus, Sparkles, AlertOctagon } from 'lucide-react';

const metrics = [
  {
    id: 'sa-metric-active',
    label: 'Active Businesses',
    value: '247',
    change: '+12 this month',
    changeType: 'positive',
    icon: Building2,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    id: 'sa-metric-mrr',
    label: 'Monthly Recurring Revenue',
    value: '€18,420',
    change: '+€1,840 vs last month',
    changeType: 'positive',
    icon: TrendingUp,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  {
    id: 'sa-metric-trials',
    label: 'Active Trials',
    value: '31',
    change: '5 expiring in 48 hrs',
    changeType: 'warning',
    icon: Clock,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    alert: true,
  },
  {
    id: 'sa-metric-churn',
    label: 'Churn Rate (30d)',
    value: '2.4%',
    change: '+0.3% vs last month',
    changeType: 'danger',
    icon: UserMinus,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    alert: true,
  },
  {
    id: 'sa-metric-new',
    label: 'New This Month',
    value: '18',
    change: '12 converted from trial',
    changeType: 'positive',
    icon: Sparkles,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    id: 'sa-metric-suspended',
    label: 'Suspended Accounts',
    value: '2',
    change: 'Payment failures',
    changeType: 'danger',
    icon: AlertOctagon,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    alert: true,
  },
];

const changeColors = {
  positive: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-accent',
};

export default function SuperAdminMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`card-base p-5 hover:shadow-card-hover transition-shadow duration-200 ${
            metric.alert ? 'border-warning/40 bg-warning/5' : ''
          } ${metric.id === 'sa-metric-churn' || metric.id === 'sa-metric-suspended' ? 'border-danger/30 bg-danger/5' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="card-label">{metric.label}</p>
            <div className={`w-8 h-8 rounded-lg ${metric.iconBg} flex items-center justify-center flex-shrink-0`}>
              <metric.icon size={16} className={metric.iconColor} />
            </div>
          </div>
          <p className="metric-value text-2xl text-foreground">{metric.value}</p>
          <p className={`text-xs mt-1.5 ${changeColors[metric.changeType as keyof typeof changeColors] || 'text-muted-foreground'}`}>
            {metric.change}
          </p>
        </div>
      ))}
    </div>
  );
}