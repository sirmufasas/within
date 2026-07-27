import React from 'react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export interface StockAlertItem {
  id: string;
  product: string;
  sku: string;
  current: string;
  minimum: string;
  status: 'out-of-stock' | 'low-stock';
}

export default function StockAlertsPanel({ alerts }: { alerts: StockAlertItem[] }) {
  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
            <AlertTriangle size={16} className="text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Stock Alerts</h3>
            <p className="text-xs text-muted-foreground">{alerts.length} item{alerts.length !== 1 ? 's' : ''} need attention</p>
          </div>
        </div>
        <Link href="/inventory" className="text-sm text-primary font-medium hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {alerts.length === 0 ? (
          <p className="px-4 sm:px-5 py-8 text-center text-sm text-muted-foreground">Everything's above minimum stock levels.</p>
        ) : (
          alerts.map((item) => (
            <div key={item.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors duration-150">
              <span className="text-2xl flex-shrink-0">📦</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.product}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TrendingDown size={11} className="text-danger flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{item.current} left (min: {item.minimum})</span>
                </div>
              </div>
              <Badge variant={item.status} dot>
                {item.status === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
              </Badge>
            </div>
          ))
        )}
      </div>
      <div className="px-4 sm:px-5 py-3 border-t border-border bg-muted/20">
        <Link href="/purchase-orders" className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2">
          <Package size={15} />
          Create Purchase Order
        </Link>
      </div>
    </div>
  );
}