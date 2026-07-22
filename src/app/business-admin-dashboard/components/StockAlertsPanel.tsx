import React from 'react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

const stockAlerts = [
  {
    id: 'stock-001',
    product: 'Sourdough Flour',
    sku: 'FL-001',
    current: '2 kg',
    minimum: '10 kg',
    status: 'out-of-stock' as const,
    icon: '🌾',
  },
  {
    id: 'stock-002',
    product: 'Butter (Unsalted)',
    sku: 'DY-004',
    current: '1.2 kg',
    minimum: '5 kg',
    status: 'out-of-stock' as const,
    icon: '🧈',
  },
  {
    id: 'stock-003',
    product: 'Rye Flour',
    sku: 'FL-003',
    current: '4 kg',
    minimum: '8 kg',
    status: 'low-stock' as const,
    icon: '🌾',
  },
  {
    id: 'stock-004',
    product: 'Pastry Cream',
    sku: 'DY-009',
    current: '3.5 L',
    minimum: '10 L',
    status: 'low-stock' as const,
    icon: '🍮',
  },
];

export default function StockAlertsPanel() {
  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
            <AlertTriangle size={16} className="text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Stock Alerts</h3>
            <p className="text-xs text-muted-foreground">4 items need attention</p>
          </div>
        </div>
        <Link href="/inventory" className="text-sm text-primary font-medium hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {stockAlerts.map((item) => (
          <div key={item.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors duration-150">
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
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
        ))}
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