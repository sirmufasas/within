import React from 'react';
import { ShoppingCart, Truck, Package, User, AlertTriangle } from 'lucide-react';

const activities = [
  {
    id: 'act-001',
    type: 'order',
    icon: ShoppingCart,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    message: 'New order #ORD-0901 from Restaurante Boa Mesa',
    time: '2 min ago',
  },
  {
    id: 'act-002',
    type: 'delivery',
    icon: Truck,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    message: 'Driver Carlos confirmed delivery of #ORD-0897',
    time: '18 min ago',
  },
  {
    id: 'act-003',
    type: 'stock',
    icon: AlertTriangle,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    message: 'Sourdough Flour dropped below minimum stock',
    time: '34 min ago',
  },
  {
    id: 'act-004',
    type: 'customer',
    icon: User,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    message: 'New customer: Ginásio FitLisboa registered',
    time: '1 hr ago',
  },
  {
    id: 'act-005',
    type: 'stock',
    icon: Package,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    message: 'Butter (Unsalted) marked as out of stock',
    time: '2 hr ago',
  },
  {
    id: 'act-006',
    type: 'order',
    icon: ShoppingCart,
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    message: 'Order #ORD-0894 cancelled by Apartamentos Turísticos',
    time: '3 hr ago',
  },
];

export default function ActivityFeed() {
  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary font-medium hover:underline">View all</button>
      </div>
      <div className="divide-y divide-border">
        {activities?.map((activity) => (
          <div key={activity?.id} className="px-4 sm:px-5 py-3.5 flex items-start gap-3 hover:bg-muted/30 transition-colors duration-150">
            <div className={`w-8 h-8 rounded-lg ${activity?.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <activity.icon size={15} className={activity?.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{activity?.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity?.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}