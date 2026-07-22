import React from 'react';

type BadgeVariant =
  | 'pending' |'confirmed' |'production' |'ready' |'out-for-delivery' |'delivered' |'cancelled' |'active' |'trial' |'expiring' |'expired' |'suspended' |'low-stock' |'out-of-stock' |'in-stock' |'success' |'warning' |'danger' |'info' |'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  production: 'bg-violet-50 text-violet-700 border border-violet-200',
  ready: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  'out-for-delivery': 'bg-orange-50 text-orange-700 border border-orange-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  trial: 'bg-sky-50 text-sky-700 border border-sky-200',
  expiring: 'bg-amber-50 text-amber-700 border border-amber-200',
  expired: 'bg-red-50 text-red-600 border border-red-200',
  suspended: 'bg-slate-100 text-slate-500 border border-slate-200',
  'low-stock': 'bg-amber-50 text-amber-700 border border-amber-200',
  'out-of-stock': 'bg-red-50 text-red-600 border border-red-200',
  'in-stock': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-sky-50 text-sky-700 border border-sky-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const dotColors: Record<BadgeVariant, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  production: 'bg-violet-500',
  ready: 'bg-cyan-500',
  'out-for-delivery': 'bg-orange-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  active: 'bg-emerald-500',
  trial: 'bg-sky-500',
  expiring: 'bg-amber-500',
  expired: 'bg-red-500',
  suspended: 'bg-slate-400',
  'low-stock': 'bg-amber-500',
  'out-of-stock': 'bg-red-500',
  'in-stock': 'bg-emerald-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
};

export default function Badge({ variant, children, dot = false, className = '' }: BadgeProps) {
  return (
    <span className={`badge-base ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`status-dot ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}