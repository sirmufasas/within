'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, Users, BarChart3, Settings, ChevronLeft, ChevronRight, Bell, LogOut, Activity, X,  } from 'lucide-react';
import WithinBranding from '@/components/WithinBranding';

interface SuperAdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
  suspendedCount: number;
  expiringCount: number;
  onSignOut?: () => void;
}

const navItems = [
  { key: 'sa-nav-dashboard', href: '/super-admin-panel', icon: LayoutDashboard, label: 'Overview' },
  { key: 'sa-nav-businesses', href: '/super-admin-panel/businesses', icon: Building2, label: 'Businesses', badge: 'suspended' },
  { key: 'sa-nav-subscriptions', href: '/super-admin-panel/subscriptions', icon: CreditCard, label: 'Subscriptions', badge: 'expiring' },
  { key: 'sa-nav-activity', href: '/super-admin-panel/activity', icon: Activity, label: 'Platform Activity' },
  { key: 'sa-nav-staff', href: '/super-admin-panel/staff', icon: Users, label: 'Staff & Admins' },
  { key: 'sa-nav-reports', href: '/super-admin-panel/reports', icon: BarChart3, label: 'Revenue Reports' },
  { key: 'sa-nav-settings', href: '/super-admin-panel/settings', icon: Settings, label: 'Settings' },
];

export default function SuperAdminSidebar({
  collapsed, onToggle, onMobileClose,
  suspendedCount, expiringCount, onSignOut,
}: SuperAdminSidebarProps) {
  const pathname = usePathname();

  const getBadge = (badgeKey?: string) => {
    if (badgeKey === 'suspended' && suspendedCount > 0) return suspendedCount;
    if (badgeKey === 'expiring' && expiringCount > 0) return expiringCount;
    return null;
  };

  const isActive = (href: string) => {
    if (href === '/super-admin-panel') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={`h-full bg-card border-r border-border flex flex-col sidebar-transition ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center border-b border-border h-16 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 within-gradient rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/assets/images/IMG-20260712-WA0001-1784701905533.jpg"
                alt="WITH-IN"
                className="w-6 h-6 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">WITH-IN</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 within-gradient rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/assets/images/IMG-20260712-WA0001-1784701905533.jpg"
              alt="WITH-IN"
              className="w-6 h-6 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="hidden lg:flex p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft size={18} />
          </button>
        )}
        {!collapsed && onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const badge = getBadge(item.badge);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onMobileClose}
              className={`nav-item ${active ? 'nav-item-active bg-primary/10' : 'nav-item-inactive'} ${collapsed ? 'justify-center px-2' : ''} relative group min-h-[44px]`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate text-sm">{item.label}</span>}
              {!collapsed && badge !== null && (
                <span className="ml-auto bg-warning text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                  {badge}
                </span>
              )}
              {collapsed && badge !== null && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-warning rounded-full border-2 border-card" />
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

      {/* Bottom */}
      <div className="border-t border-border p-2 space-y-0.5">
        <Link
          href="/super-admin-panel/activity"
          onClick={onMobileClose}
          className={`nav-item nav-item-inactive ${collapsed ? 'justify-center px-2' : ''} group relative min-h-[44px]`}
        >
          <Bell size={20} className="flex-shrink-0" />
          {!collapsed && <span className="truncate text-sm">Alerts</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-primary-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
              Alerts
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
            className="w-full flex justify-center items-center p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all min-h-[44px]"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}