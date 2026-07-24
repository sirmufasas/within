'use client';
import React from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';

export const dynamic = 'force-dynamic';
import SuperAdminMetrics from './components/SuperAdminMetrics';
import SuperAdminCharts from './components/SuperAdminCharts';
import BusinessesTable from './components/BusinessesTable';
import RecentSignups from './components/RecentSignups';

export default function SuperAdminPanelPage() {
  const today = new Date()?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SuperAdminLayout
      adminName="Ricardo Alves"
      suspendedCount={2}
      expiringCount={5}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {today} · WITH-IN Super Admin Console
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="input-field w-36 text-sm py-2.5">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
            <a href="/super-admin-panel/businesses" className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
              + Onboard Business
            </a>
          </div>
        </div>

        <SuperAdminMetrics />
        <SuperAdminCharts />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <BusinessesTable />
          </div>
          <div>
            <RecentSignups />
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}