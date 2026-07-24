'use client';
import React from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Activity, User, Building2, CreditCard, Settings, LogIn } from 'lucide-react';

export const dynamic = 'force-dynamic';

const mockActivity = [
  { id: '1', type: 'signup', user: 'Maria Santos', business: 'Fresh Cuts Butchery', action: 'New business registered', time: '2 hours ago' },
  { id: '2', type: 'login', user: 'Joao Silva', business: 'Padaria Sao Joao', action: 'User signed in', time: '3 hours ago' },
  { id: '3', type: 'subscription', user: 'System', business: 'Café Lisboa', action: 'Subscription expired', time: '1 day ago' },
  { id: '4', type: 'settings', user: 'Joao Silva', business: 'Padaria Sao Joao', action: 'Business settings updated', time: '2 days ago' },
  { id: '5', type: 'signup', user: 'Pedro Alves', business: 'Café Lisboa', action: 'New business registered', time: '4 months ago' },
  { id: '6', type: 'subscription', user: 'System', business: 'Distribuidora Norte', action: 'Upgraded to Enterprise plan', time: '8 months ago' },
];

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  signup: { icon: <Building2 size={14} />, color: 'bg-success/10 text-success' },
  login: { icon: <LogIn size={14} />, color: 'bg-info/10 text-info' },
  subscription: { icon: <CreditCard size={14} />, color: 'bg-primary/10 text-primary' },
  settings: { icon: <Settings size={14} />, color: 'bg-muted text-muted-foreground' },
};

export default function SuperAdminActivityPage() {
  return (
    <SuperAdminLayout adminName="Ricardo Alves" suspendedCount={2} expiringCount={5}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Activity</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Recent activity across all businesses</p>
        </div>

        <div className="space-y-3">
          {mockActivity.map((item) => {
            const config = typeConfig[item.type] || { icon: <Activity size={14} />, color: 'bg-muted text-muted-foreground' };
            return (
              <div key={item.id} className="card-base p-4 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.action}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.user} · {item.business}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
