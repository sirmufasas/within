'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { CheckCircle, AlertTriangle, Clock, XCircle, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  {
    name: 'Starter',
    price: 299,
    features: ['Up to 3 users', '50 products', 'Orders & Customers', 'Basic Reports'],
    recommended: false,
  },
  {
    name: 'Professional',
    price: 599,
    features: ['Up to 10 users', '500 products', 'Full Inventory', 'Advanced Reports', 'Multi-location'],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 1299,
    features: ['Unlimited users', 'Unlimited products', 'All features', 'API Access', 'Priority Support'],
    recommended: false,
  },
];

const mockBillingHistory = [
  { id: 'INV-2026-002', date: '2026-07-01', plan: 'Professional', amount: 599.00, status: 'paid' },
  { id: 'INV-2026-001', date: '2026-06-01', plan: 'Professional', amount: 599.00, status: 'paid' },
  { id: 'INV-2026-000', date: '2026-05-01', plan: 'Starter', amount: 299.00, status: 'paid' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  trial: { label: 'Free Trial', color: 'bg-info/10 text-info border-info/20', icon: <Clock size={16} /> },
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/20', icon: <CheckCircle size={16} /> },
  expired: { label: 'Expired', color: 'bg-danger/10 text-danger border-danger/20', icon: <XCircle size={16} /> },
  suspended: { label: 'Suspended', color: 'bg-warning/10 text-warning border-warning/20', icon: <AlertTriangle size={16} /> },
};

export default function SubscriptionPage() {
  const { business } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const subscriptionStatus = (business?.subscription_status || 'trial') as keyof typeof statusConfig;
  const currentPlan = business?.plan || 'starter';
  const statusInfo = statusConfig[subscriptionStatus];

  const trialDaysLeft = business?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(business.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your plan and billing</p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className={`card-base p-5 border ${statusInfo.color}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <p className="font-semibold text-foreground">
                  {statusInfo.label} — {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                </p>
                {subscriptionStatus === 'trial' && (
                  <p className="text-sm text-muted-foreground">
                    {trialDaysLeft} days remaining in your free trial
                  </p>
                )}
                {subscriptionStatus === 'active' && (
                  <p className="text-sm text-muted-foreground">
                    Next billing: 1 August 2026 · R {currentPlan === 'professional' ? '599.00' : '299.00'}
                  </p>
                )}
                {subscriptionStatus === 'expired' && (
                  <p className="text-sm text-muted-foreground">
                    Your subscription expired. Renew to restore full access.
                  </p>
                )}
                {subscriptionStatus === 'suspended' && (
                  <p className="text-sm text-muted-foreground">
                    Account suspended. Please contact support.
                  </p>
                )}
              </div>
            </div>
            {(subscriptionStatus === 'trial' || subscriptionStatus === 'expired') && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="btn-primary text-sm whitespace-nowrap"
              >
                Upgrade Now
              </button>
            )}
          </div>

          {subscriptionStatus === 'trial' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Trial Progress</span>
                <span>{14 - trialDaysLeft}/14 days used</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full within-gradient rounded-full transition-all"
                  style={{ width: `${((14 - trialDaysLeft) / 14) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name.toLowerCase() === currentPlan;
              return (
                <div
                  key={plan.name}
                  className={`card-base p-5 relative ${plan.recommended ? 'border-primary ring-1 ring-primary/20' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-foreground">R {plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-secondary-foreground">
                        <CheckCircle size={14} className="text-success flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setSelectedPlan(plan); setShowUpgradeModal(true); }}
                    disabled={isCurrent}
                    className={`w-full text-sm py-2.5 rounded-lg font-medium transition-all ${
                      isCurrent
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : plan.recommended
                        ? 'btn-primary' :'btn-secondary'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <div className="card-base overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Invoice</th>
                  <th className="table-header">Date</th>
                  <th className="table-header hidden sm:table-cell">Plan</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockBillingHistory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <span className="font-mono text-sm font-semibold text-foreground">{inv.id}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-foreground">{inv.date}</span>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="text-sm text-foreground">{inv.plan}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-foreground">R {inv.amount.toFixed(2)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${inv.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowUpgradeModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Upgrade to {selectedPlan?.name || 'Professional'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Payment integration coming soon. Your plan will be activated once payment is processed.
              </p>
              <div className="p-4 bg-muted/30 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{selectedPlan?.name || 'Professional'} Plan</span>
                  <span className="font-bold text-foreground">R {selectedPlan?.price || 599}/month</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Card Number</label>
                  <input type="text" className="input-field" placeholder="•••• •••• •••• ••••" disabled />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Expiry</label>
                    <input type="text" className="input-field" placeholder="MM/YY" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
                    <input type="text" className="input-field" placeholder="•••" disabled />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mb-4">
                🔒 Payment processing coming soon — architecture ready
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => setShowUpgradeModal(false)} className="btn-primary flex-1 text-sm">Coming Soon</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
