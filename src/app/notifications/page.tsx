'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import {
  CheckCircle, Package, ShoppingCart, CreditCard, Bell,
  Trash2, Filter, TrendingUp, AlertTriangle, Users, Truck,
} from 'lucide-react';

type NotifType = 'order' | 'stock' | 'subscription' | 'business' | 'delivery' | 'customer';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionHref?: string;
}

const typeConfig: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  order: { icon: <ShoppingCart size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
  stock: { icon: <Package size={16} />, color: 'text-warning', bg: 'bg-warning/10' },
  subscription: { icon: <CreditCard size={16} />, color: 'text-info', bg: 'bg-info/10' },
  business: { icon: <TrendingUp size={16} />, color: 'text-success', bg: 'bg-success/10' },
  delivery: { icon: <Truck size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
  customer: { icon: <Users size={16} />, color: 'text-secondary-foreground', bg: 'bg-muted' },
};

const priorityDot: Record<string, string> = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-muted-foreground',
};

const mockNotifications: Notification[] = [
  {
    id: '1', type: 'order', title: 'New Order Received', priority: 'high',
    message: 'Café Central placed order #ORD-007 for R 245.50 — 12 items, delivery by 14:30.',
    time: '5 min ago', read: false, actionLabel: 'View Order', actionHref: '/orders',
  },
  {
    id: '2', type: 'stock', title: 'Critical Stock Alert', priority: 'high',
    message: 'Croissant stock is critically low — only 5 units remaining. Reorder threshold is 20.',
    time: '1 hour ago', read: false, actionLabel: 'View Inventory', actionHref: '/inventory',
  },
  {
    id: '3', type: 'subscription', title: 'Trial Ending Soon', priority: 'medium',
    message: 'Your free trial ends in 7 days. Upgrade to continue using all features without interruption.',
    time: '2 hours ago', read: false, actionLabel: 'Upgrade Plan', actionHref: '/subscription',
  },
  {
    id: '4', type: 'delivery', title: 'Order Out for Delivery', priority: 'medium',
    message: 'Order #ORD-001 is now out for delivery. Driver Miguel Santos is en route to Café Central.',
    time: '3 hours ago', read: false, actionLabel: 'Track Order', actionHref: '/order-tracking',
  },
  {
    id: '5', type: 'business', title: 'Daily Revenue Milestone', priority: 'low',
    message: "Today's revenue has reached R 1,200 — 20% above yesterday's performance. Great work!",
    time: '4 hours ago', read: true,
  },
  {
    id: '6', type: 'order', title: 'Order Delivered', priority: 'low',
    message: 'Order #ORD-004 was successfully delivered to Hotel Lisboa. Customer confirmed receipt.',
    time: '5 hours ago', read: true, actionLabel: 'View Order', actionHref: '/orders',
  },
  {
    id: '7', type: 'stock', title: 'Stock Replenished', priority: 'low',
    message: 'Farinha T65 restocked: 200kg added to Dry Store A by supplier Moinhos do Norte.',
    time: 'Yesterday', read: true,
  },
  {
    id: '8', type: 'customer', title: 'New Customer Registered', priority: 'low',
    message: 'Supermercado Sol has registered and placed their first order worth R 765.00.',
    time: 'Yesterday', read: true, actionLabel: 'View Customer', actionHref: '/customers',
  },
  {
    id: '9', type: 'order', title: 'Order Cancelled', priority: 'medium',
    message: 'Order #ORD-006 from Café Central was cancelled. Reason: Customer changed mind.',
    time: '2 days ago', read: true,
  },
  {
    id: '10', type: 'business', title: 'Weekly Report Ready', priority: 'low',
    message: 'Your weekly performance report is ready. Revenue up 12%, orders up 8% vs last week.',
    time: '3 days ago', read: true, actionLabel: 'View Report', actionHref: '/reports',
  },
];

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'order', label: 'Orders' },
  { key: 'stock', label: 'Stock' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'business', label: 'Business' },
  { key: 'subscription', label: 'Subscription' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifications(notifications.filter((n) => n.id !== id));
  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    const matchType = activeFilter === 'all' || n.type === activeFilter;
    const matchRead = !showUnreadOnly || !n.read;
    return matchType && matchRead;
  });

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1.5">
                <CheckCircle size={15} />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="btn-secondary text-sm flex items-center gap-1.5 text-danger hover:bg-danger/10">
                <Trash2 size={15} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Unread', count: notifications.filter(n => !n.read).length, color: 'text-primary', bg: 'bg-primary/10', icon: <Bell size={18} className="text-primary" /> },
            { label: 'High Priority', count: notifications.filter(n => n.priority === 'high' && !n.read).length, color: 'text-danger', bg: 'bg-danger/10', icon: <AlertTriangle size={18} className="text-danger" /> },
            { label: 'Orders', count: notifications.filter(n => n.type === 'order').length, color: 'text-primary', bg: 'bg-primary/10', icon: <ShoppingCart size={18} className="text-primary" /> },
            { label: 'Stock Alerts', count: notifications.filter(n => n.type === 'stock').length, color: 'text-warning', bg: 'bg-warning/10', icon: <Package size={18} className="text-warning" /> },
          ].map((card) => (
            <div key={card.label} className="card-base p-4">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
                {card.icon}
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.count}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === tab.key
                    ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({notifications.filter(n => n.type === tab.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              showUnreadOnly ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter size={14} />
            Unread only
          </button>
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="card-base p-12 text-center">
              <Bell size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No notifications</p>
              <p className="text-xs text-muted-foreground">
                {showUnreadOnly ? 'No unread notifications in this category.' : 'Nothing here yet.'}
              </p>
            </div>
          ) : (
            filtered.map((notif) => {
              const config = typeConfig[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`card-base p-4 flex items-start gap-4 transition-all group ${
                    !notif.read ? 'border-primary/20 bg-primary/2' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <span className={config.color}>{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-secondary-foreground'}`}>
                          {notif.title}
                        </p>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[notif.priority]}`} title={`${notif.priority} priority`} />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
                    {notif.actionLabel && (
                      <a
                        href={notif.actionHref}
                        className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
                      >
                        {notif.actionLabel} →
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-success transition-all"
                        title="Mark as read"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </BusinessLayout>
  );
}
