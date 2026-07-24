'use client';
import React, { useState, useEffect } from 'react';
import BusinessSidebar from '@/components/BusinessSidebar';
import BusinessTopbar from '@/components/BusinessTopbar';
import { useAuth } from '@/contexts/AuthContext';
import WithinLoader from '@/components/WithinLoader';
import { usePathname, useRouter } from 'next/navigation';
import { hasRouteAccess, minPlanFor, planLabel } from '@/lib/planAccess';
import { Lock } from 'lucide-react';

interface BusinessLayoutProps {
  children: React.ReactNode;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, userProfile, business, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  const allowed = hasRouteAccess(business?.plan, pathname || '');
  const requiredPlan = minPlanFor(pathname || '');

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
          plan={business?.plan}
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
          {allowed ? children : (
            <div className="flex flex-col items-center justify-center text-center py-24 px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Lock size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">This screen needs the {requiredPlan ? planLabel(requiredPlan) : 'a higher'} plan</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Your business is currently on the {planLabel(business?.plan)} plan, which doesn't include this feature.
                Upgrade to unlock it.
              </p>
              <button onClick={() => router.push('/subscription')} className="btn-primary text-sm">
                View Plans
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}