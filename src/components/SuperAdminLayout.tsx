'use client';
import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import SuperAdminTopbar from '@/components/SuperAdminTopbar';
import { useAuth } from '@/contexts/AuthContext';
import WithinLoader from '@/components/WithinLoader';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  adminName: string;
  suspendedCount: number;
  expiringCount: number;
}

export default function SuperAdminLayout({
  children, adminName, suspendedCount, expiringCount,
}: SuperAdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, userProfile, signOut } = useAuth();

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

  if (!mounted || loading) return <WithinLoader message="Loading admin console..." />;
  if (!user) return null;

  const displayName = userProfile?.full_name || adminName;

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <div className={`fixed left-0 top-0 h-full z-30 sidebar-transition ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <SuperAdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onMobileClose={() => setMobileOpen(false)}
          suspendedCount={suspendedCount}
          expiringCount={expiringCount}
          onSignOut={signOut}
        />
      </div>

      <SuperAdminTopbar
        adminName={displayName}
        sidebarCollapsed={collapsed}
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
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