'use client';
import React, { useState, useEffect } from 'react';
import BusinessSidebar from '@/components/BusinessSidebar';
import BusinessTopbar from '@/components/BusinessTopbar';
import { useAuth } from '@/contexts/AuthContext';
import WithinLoader from '@/components/WithinLoader';

interface BusinessLayoutProps {
  children: React.ReactNode;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, userProfile, business, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      window.location.href = '/';
    }
  }, [mounted, loading, user]);

  if (!mounted || loading) return <WithinLoader message="Loading your workspace..." />;
  if (!user) return null;

  const businessName = business?.name || userProfile?.full_name || 'My Business';
  const businessType = business?.business_type || 'business';
  const ownerName = userProfile?.full_name || user?.email || 'User';
  const ownerRole = userProfile?.role || 'owner';
  const logoUrl = business?.logo_url || null;

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full z-30 sidebar-transition ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <BusinessSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onMobileClose={() => setMobileOpen(false)}
          businessName={businessName}
          businessType={businessType}
          logoUrl={logoUrl}
          pendingOrders={0}
          stockAlerts={0}
          onSignOut={signOut}
        />
      </div>

      <BusinessTopbar
        businessName={businessName}
        businessLogo={logoUrl || undefined}
        ownerName={ownerName}
        ownerRole={ownerRole}
        sidebarCollapsed={collapsed}
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        lastUpdated="Just now"
        onSignOut={signOut}
      />

      <main className={`content-transition pt-16 min-h-screen ${collapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <div className="p-4 sm:p-6 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}