import {
  LayoutDashboard, ShoppingCart, MapPin, Users, LineChart, UserCircle, Package,
  Warehouse, Sheet as SheetIcon, FileText, CreditCard, Truck, UserCog, BarChart3, Settings, Key,
} from 'lucide-react';

export type Plan = 'starter' | 'professional' | 'enterprise';

const PLAN_RANK: Record<Plan, number> = { starter: 0, professional: 1, enterprise: 2 };

// Routes not listed here are available on every plan (dashboard, orders,
// customers, products, staff, reports, subscription, settings). Only the
// more advanced/operational screens are gated, matching the feature bullets
// shown on the Subscription page's plan cards.
export const ROUTE_MIN_PLAN: Record<string, Plan> = {
  '/order-tracking': 'professional',
  '/customer-analytics': 'professional',
  '/customer-portal': 'professional',
  '/inventory': 'professional',
  '/stock-sheet': 'professional',
  '/estimates': 'professional',
  '/purchase-orders': 'professional',
  '/drivers': 'professional',
};

const PLAN_LABEL: Record<Plan, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

function normalizePlan(plan: string | null | undefined): Plan {
  if (plan === 'professional' || plan === 'enterprise') return plan;
  return 'starter';
}

// Every screen in the app, tagged with the plan that unlocks it. This is the
// single source of truth — both the sidebar/route guard AND the Subscription
// page's plan cards read from this list, so they can never drift apart.
export const ALL_SCREENS: { label: string; minPlan: Plan; icon: any }[] = [
  { label: 'Dashboard', minPlan: 'starter', icon: LayoutDashboard },
  { label: 'Orders', minPlan: 'starter', icon: ShoppingCart },
  { label: 'Order Tracking', minPlan: 'professional', icon: MapPin },
  { label: 'Customers', minPlan: 'starter', icon: Users },
  { label: 'Customer Analytics', minPlan: 'professional', icon: LineChart },
  { label: 'Customer Portal', minPlan: 'professional', icon: UserCircle },
  { label: 'Products', minPlan: 'starter', icon: Package },
  { label: 'Stocks', minPlan: 'professional', icon: Warehouse },
  { label: 'Stock Sheet (Google)', minPlan: 'professional', icon: SheetIcon },
  { label: 'Estimates', minPlan: 'professional', icon: FileText },
  { label: 'Purchase Orders', minPlan: 'professional', icon: CreditCard },
  { label: 'Drivers', minPlan: 'professional', icon: Truck },
  { label: 'Staff', minPlan: 'starter', icon: UserCog },
  { label: 'Reports', minPlan: 'starter', icon: BarChart3 },
  { label: 'Subscription', minPlan: 'starter', icon: CreditCard },
  { label: 'Settings', minPlan: 'starter', icon: Settings },
  { label: 'API Access', minPlan: 'enterprise', icon: Key },
];

/** Every screen a business on `plan` can access (cumulative — higher plans include lower ones). */
export function screensForPlan(plan: Plan) {
  const rank = PLAN_RANK[plan];
  return ALL_SCREENS.filter((s) => PLAN_RANK[s.minPlan] <= rank);
}

/** Just the screens a plan adds on top of the tier below it (for "Everything in Starter, plus:" style copy). */
export function screensAddedByPlan(plan: Plan) {
  const rank = PLAN_RANK[plan];
  return ALL_SCREENS.filter((s) => PLAN_RANK[s.minPlan] === rank);
}

/** Whether a business on `plan` can access `path` (matches by prefix, so /drivers/anything is covered by the /drivers rule). */
export function hasRouteAccess(plan: string | null | undefined, path: string): boolean {
  const required = Object.entries(ROUTE_MIN_PLAN).find(([route]) => path === route || path.startsWith(`${route}/`));
  if (!required) return true;
  const rank = PLAN_RANK[normalizePlan(plan)];
  return rank >= PLAN_RANK[required[1]];
}

/** The minimum plan required for a given path, or null if it's available to everyone. */
export function minPlanFor(path: string): Plan | null {
  const required = Object.entries(ROUTE_MIN_PLAN).find(([route]) => path === route || path.startsWith(`${route}/`));
  return required ? required[1] : null;
}

export function planLabel(plan: string | null | undefined): string {
  return PLAN_LABEL[normalizePlan(plan)];
}
