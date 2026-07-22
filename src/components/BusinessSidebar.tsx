'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Users, Package,
  Truck, BarChart3, Settings, ChevronLeft, ChevronRight,
  Bell, LogOut, X, CreditCard, Warehouse, UserCircle, UserCog,
  MapPin, LineChart,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import WithinBranding from '@/components/WithinBranding';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
  businessName: string;
  businessType: string;
  logoUrl?: string | null;
  pendingOrders: number;
  stockAlerts: number;
  onSignOut?: () => void;
}

const navItems = [
  { key: 'nav-dashboard', href: '/business-admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'nav-orders', href: '/orders', icon: ShoppingCart, label: 'Orders', badge: 'orders' },
  { key: 'nav-order-tracking', href: '/order-tracking', icon: MapPin, label: 'Order Tracking' },
  { key: 'nav-customers', href: '/customers', icon: Users, label: 'Customers' },
  { key: 'nav-customer-analytics', href: '/customer-analytics', icon: LineChart, label: 'Customer Analytics' },
  { key: 'nav-customer-portal', href: '/customer-portal', icon: UserCircle, label: 'Customer Portal' },
  { key: 'nav-products', href: '/products', icon: Package, label: 'Products', badge: 'stock' },
  { key: 'nav-inventory', href: '/inventory', icon: Warehouse, label: 'Inventory' },
  { key: 'nav-drivers', href: '/drivers', icon: Truck, label: 'Drivers' },
  { key: 'nav-staff', href: '/staff-management', icon: UserCog, label: 'Staff' },
  { key: 'nav-reports', href: '/reports', icon: BarChart3, label: 'Reports' },
  { key: 'nav-subscription', href: '/subscription', icon: CreditCard, label: 'Subscription' },
  { key: 'nav-settings', href: '/settings', icon: Settings, label: 'Settings' },
];

export default function BusinessSidebar({
  collapsed, onToggle, onMobileClose,
  businessName, businessType, logoUrl,
  pendingOrders, stockAlerts, onSignOut,
}: SidebarProps) {
  const pathname = usePathname();

  const getBadge = (badgeKey?: string) => {
    if (badgeKey === 'orders' && pendingOrders > 0) return pendingOrders;
    if (badgeKey === 'stock' && stockAlerts > 0) return stockAlerts;
    return null;
  };

  const isActive = (href: string) => {
    if (href === '/business-admin-dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={`h-full bg-card border-r border-border flex flex-col ${collapsed ? 'w-16' : 'w-64'} sidebar-transition`}>
      {/* Logo Area */}
      <div className={`flex items-center border-b border-border h-16 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg flex-shrink-0 within-gradient flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={businessName} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <AppLogo size={28} src="/assets/images/app_logo.png" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">{businessName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{businessType}</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg within-gradient flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <AppLogo size={28} src="/assets/images/app_logo.png" />
            )}
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {!collapsed && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const badge = getBadge(item.badge);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onMobileClose}
              className={`nav-item ${active ? 'nav-item-active bg-primary/10' : 'nav-item-inactive'} ${
                collapsed ? 'justify-center px-2' : ''
              } relative group min-h-[44px]`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate text-sm">{item.label}</span>}
              {!collapsed && badge !== null && (
                <span className="ml-auto bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                  {badge}
                </span>
              )}
              {collapsed && badge !== null && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-card" />
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-primary-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-2 space-y-0.5">
        <Link
          href="/notifications"
          onClick={onMobileClose}
          className={`nav-item nav-item-inactive ${collapsed ? 'justify-center px-2' : ''} group relative min-h-[44px]`}
        >
          <Bell size={20} className="flex-shrink-0" />
          {!collapsed && <span className="truncate text-sm">Notifications</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-primary-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
              Notifications
            </span>
          )}
        </Link>

        <button
          onClick={onSignOut}
          className={`nav-item text-danger hover:bg-danger/10 hover:text-danger w-full ${collapsed ? 'justify-center px-2' : ''} group relative min-h-[44px]`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="truncate text-sm font-medium">Sign Out</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-primary-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
              Sign Out
            </span>
          )}
        </button>

        {!collapsed && (
          <div className="pt-2 pb-1">
            <WithinBranding variant="inline" />
          </div>
        )}

        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 min-h-[44px] items-center"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}