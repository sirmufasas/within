'use client';
import React from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import DashboardMetrics from './components/DashboardMetrics';
import DashboardCharts from './components/DashboardCharts';
import RecentOrdersTable from './components/RecentOrdersTable';
import StockAlertsPanel from './components/StockAlertsPanel';
import ActivityFeed from './components/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';

export default function BusinessAdminDashboardPage() {
  const { business, userProfile } = useAuth();
  const today = new Date()?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {today} · {business?.name || 'Your Business'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="input-field w-36 text-sm py-2.5">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <a href="/orders" className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
              + New Order
            </a>
          </div>
        </div>

        <DashboardMetrics />
        <DashboardCharts />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentOrdersTable />
          </div>
          <div className="space-y-6">
            <StockAlertsPanel />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}