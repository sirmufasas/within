import React from 'react';
import { Building2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const signups = [
  {
    id: 'signup-001',
    name: 'Restaurante O Forno',
    type: 'Restaurant',
    typeEmoji: '🍽️',
    plan: 'Growth',
    status: 'trial' as const,
    joined: '15/07/2026',
    time: '5 days ago',
    icon: Building2,
  },
  {
    id: 'signup-002',
    name: 'CleanPro Supplies',
    type: 'Cleaning',
    typeEmoji: '🧹',
    plan: 'Growth',
    status: 'trial' as const,
    joined: '18/07/2026',
    time: '2 days ago',
    icon: Building2,
  },
  {
    id: 'signup-003',
    name: 'Mercearia Bairro Alto',
    type: 'Wholesaler',
    typeEmoji: '📦',
    plan: 'Starter',
    status: 'trial' as const,
    joined: '19/07/2026',
    time: '1 day ago',
    icon: Building2,
  },
  {
    id: 'signup-004',
    name: 'Pastelaria Doce Lar',
    type: 'Bakery',
    typeEmoji: '🥖',
    plan: 'Starter',
    status: 'expiring' as const,
    joined: '20/04/2025',
    time: 'Expiring soon',
    icon: AlertTriangle,
  },
  {
    id: 'signup-005',
    name: 'Padaria São Jorge',
    type: 'Bakery',
    typeEmoji: '🥖',
    plan: 'Growth',
    status: 'expiring' as const,
    joined: '10/06/2025',
    time: 'Renewal overdue',
    icon: Clock,
  },
];

const platformActivity = [
  { id: 'pa-001', message: 'Distribuidora Norte processed 2,891 orders this month — highest volume tenant', type: 'success', time: '1 hr ago' },
  { id: 'pa-002', message: 'Talho do Mercado payment failed for 3rd consecutive month — auto-suspended', type: 'danger', time: '3 hr ago' },
  { id: 'pa-003', message: 'Platform MRR crossed R 18,000 milestone', type: 'success', time: '6 hr ago' },
  { id: 'pa-004', message: '5 trial accounts expiring within 48 hours — reminder emails queued', type: 'warning', time: '12 hr ago' },
];

const activityColors = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-accent/10 text-accent',
};

export default function RecentSignups() {
  return (
    <div className="space-y-6">
      {/* Recent Signups */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Signups & Alerts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">New trials + expiring accounts</p>
          </div>
          <TrendingUp size={16} className="text-success" />
        </div>
        <div className="divide-y divide-border">
          {signups.map((signup) => (
            <div key={signup.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors duration-150">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                {signup.typeEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{signup.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground">{signup.type}</span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className={`text-xs font-medium ${signup.plan === 'Pro' ? 'text-violet-600' : signup.plan === 'Growth' ? 'text-primary' : 'text-slate-500'}`}>
                    {signup.plan}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge variant={signup.status} dot>
                  {signup.status === 'trial' ? 'Trial' : 'Expiring'}
                </Badge>
                <span className="text-xs text-muted-foreground">{signup.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Activity */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Platform Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">System events & milestones</p>
        </div>
        <div className="divide-y divide-border">
          {platformActivity.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors duration-150">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                item.type === 'success' ? 'bg-success'
                : item.type === 'danger' ? 'bg-danger'
                : item.type === 'warning'? 'bg-warning' :'bg-accent'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}