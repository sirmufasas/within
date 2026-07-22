'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { CheckCircle, Info, Package, ShoppingCart, CreditCard } from 'lucide-react';

const mockNotifications = [
  { id: '1', type: 'order', title: 'New Order Received', message: 'Café Central placed order #ORD-007 for R 245.50', time: '5 min ago', read: false },
  { id: '2', type: 'stock', title: 'Low Stock Alert', message: 'Croissant stock is critically low (5 units remaining)', time: '1 hour ago', read: false },
  { id: '3', type: 'subscription', title: 'Trial Ending Soon', message: 'Your free trial ends in 7 days. Upgrade to continue.', time: '2 hours ago', read: false },
  { id: '4', type: 'order', title: 'Order Delivered', message: 'Order #ORD-004 was delivered to Hotel Lisboa', time: '3 hours ago', read: true },
  { id: '5', type: 'stock', title: 'Stock Replenished', message: 'Farinha T65 restocked: 200kg added to Dry Store A', time: 'Yesterday', read: true },
];

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  order: { icon: <ShoppingCart size={16} />, color: 'bg-primary/10 text-primary' },
  stock: { icon: <Package size={16} />, color: 'bg-warning/10 text-warning' },
  subscription: { icon: <CreditCard size={16} />, color: 'bg-info/10 text-info' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread notifications</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm">
              <CheckCircle size={16} /> Mark All Read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || { icon: <Info size={16} />, color: 'bg-muted text-muted-foreground' };
            return (
              <div
                key={notif.id}
                className={`card-base p-4 flex items-start gap-4 transition-all ${!notif.read ? 'border-primary/20 bg-primary/2' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-secondary-foreground'}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BusinessLayout>
  );
}
