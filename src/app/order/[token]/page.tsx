import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import OrderPortalClient, { type PortalProduct, type PortalHistoryOrder } from './OrderPortalClient';

export const dynamic = 'force-dynamic';

function tomorrowDate(): { iso: string; label: string } {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const iso = d.toISOString().slice(0, 10);
  const label = d.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' });
  return { iso, label };
}

export default async function CustomerOrderPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: access } = await supabase
    .from('customer_portal_access')
    .select('id, business_id, customer_id, is_active')
    .eq('portal_token', token)
    .maybeSingle();

  if (!access || !access.is_active) {
    notFound();
  }

  const [businessRes, customerRes, curatedRes, historyRes] = await Promise.all([
    supabase.from('businesses').select('name, logo_url, primary_color, secondary_color, max_order_products').eq('id', access.business_id).single(),
    supabase.from('customers').select('name').eq('id', access.customer_id).single(),
    supabase
      .from('customer_products')
      .select('sort_order, products ( id, name, unit, selling_price, category, is_active )')
      .eq('customer_id', access.customer_id)
      .order('sort_order'),
    supabase
      .from('order_submissions')
      .select(`
        id, for_date, delivery_date, status, created_at,
        order_submission_items ( quantity, unit_price, product_name, products ( selling_price ) )
      `)
      .eq('customer_id', access.customer_id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // Best-effort — don't block the page if this fails.
  supabase.from('customer_portal_access').update({ last_login_at: new Date().toISOString() }).eq('id', access.id).then();

  const products: PortalProduct[] = (curatedRes.data || [])
    .map((row: any) => row.products)
    .filter((p: any) => p && p.is_active);

  const history: PortalHistoryOrder[] = (historyRes.data as any[] || []).map((o) => ({
    id: o.id,
    for_date: o.for_date,
    delivery_date: o.delivery_date,
    status: o.status,
    items: (o.order_submission_items || []).map((it: any) => ({
      product_name: it.product_name,
      quantity: it.quantity,
      unit_price: it.unit_price && it.unit_price > 0 ? it.unit_price : (it.products?.selling_price || 0),
    })),
  }));

  const { iso, label } = tomorrowDate();

  // Matches the reference app: if the customer already has an order in for
  // tomorrow, show the "received" screen (with an add-on option) instead of
  // the ordering form.
  const todaySubmission = (historyRes.data as any[] || []).find((o) => o.for_date === iso);
  const todayOrder = todaySubmission
    ? {
        totalItems: (todaySubmission.order_submission_items || []).reduce((s: number, it: any) => s + it.quantity, 0),
      }
    : null;

  return (
    <OrderPortalClient
      token={token}
      businessName={businessRes.data?.name || 'Order Portal'}
      logoUrl={businessRes.data?.logo_url || null}
      primaryColor={businessRes.data?.primary_color || '#4F46E5'}
      customerName={customerRes.data?.name || 'Customer'}
      maxProducts={businessRes.data?.max_order_products ?? null}
      products={products}
      history={history}
      todayOrder={todayOrder}
      forDateIso={iso}
      forDateLabel={label}
    />
  );
}
