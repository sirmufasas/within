'use client';
import React from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Settings, Bell, Globe, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SuperAdminSettingsPage() {
  return (
    <SuperAdminLayout adminName="Ricardo Alves" suspendedCount={2} expiringCount={5}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure the WITH-IN platform</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="card-base p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe size={16} /> Platform Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Platform Name</label>
                <input type="text" className="input-field" defaultValue="WITH-IN" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Support Email</label>
                <input type="email" className="input-field" defaultValue="support@within.app" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Default Trial Period (days)</label>
                <input type="number" className="input-field" defaultValue="14" />
              </div>
            </div>
          </div>

          <div className="card-base p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell size={16} /> Notification Settings
            </h3>
            <div className="space-y-3">
              {[
                { label: 'New Business Signup', enabled: true },
                { label: 'Subscription Expiry Alerts', enabled: true },
                { label: 'Payment Failures', enabled: true },
                { label: 'Weekly Platform Report', enabled: false },
              ]?.map((n, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground">{n?.label}</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n?.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary text-sm">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
