'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

interface SubmitItem {
  product_id: string;
  quantity: number;
}

export async function submitOrder(token: string, items: SubmitItem[], message?: string) {
  const validItems = items.filter((it) => it.quantity > 0);
  if (validItems.length === 0) {
    return { error: 'Select at least one product.' };
  }

  const supabase = createAdminClient();

  // Re-validate the token server-side — never trust anything from the client
  // about which customer/business this order belongs to.
  const { data: access } = await supabase
    .from('customer_portal_access')
    .select('business_id, customer_id, is_active')
    .eq('portal_token', token)
    .maybeSingle();

  if (!access || !access.is_active) {
    return { error: 'This order link is no longer valid.' };
  }

  // Only allow ordering products that actually belong to this business,
  // and stamp price/name from the server's own data — never from the client.
  const productIds = validItems.map((it) => it.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, selling_price')
    .eq('business_id', access.business_id)
    .in('id', productIds);

  if (productsError) return { error: productsError.message };

  const productMap = new Map((products || []).map((p) => [p.id, p]));
  const orderItems = validItems
    .filter((it) => productMap.has(it.product_id))
    .map((it) => {
      const p = productMap.get(it.product_id)!;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: it.quantity,
        unit_price: p.selling_price || 0,
      };
    });

  if (orderItems.length === 0) {
    return { error: 'None of the selected products could be found.' };
  }

  const forDate = new Date();
  forDate.setDate(forDate.getDate() + 1);

  const { data: submission, error: subError } = await supabase
    .from('order_submissions')
    .insert({
      business_id: access.business_id,
      customer_id: access.customer_id,
      for_date: forDate.toISOString().slice(0, 10),
      total_items: orderItems.reduce((s, it) => s + it.quantity, 0),
      order_type: 'customer_portal',
      status: 'pending',
      payment_status: 'pending',
      synced_to_sheet: false,
      notes: message?.trim() || null,
    })
    .select('id')
    .single();

  if (subError) return { error: subError.message };

  const { error: itemsError } = await supabase.from('order_submission_items').insert(
    orderItems.map((it) => ({ ...it, submission_id: submission.id }))
  );

  if (itemsError) return { error: itemsError.message };

  revalidatePath(`/order/${token}`);
  return { success: true };
}

export async function addOnToOrder(token: string, items: SubmitItem[], message?: string) {
  const validItems = items.filter((it) => it.quantity > 0);
  if (validItems.length === 0) {
    return { error: 'Select at least one product.' };
  }

  const supabase = createAdminClient();

  const { data: access } = await supabase
    .from('customer_portal_access')
    .select('business_id, customer_id, is_active')
    .eq('portal_token', token)
    .maybeSingle();

  if (!access || !access.is_active) {
    return { error: 'This order link is no longer valid.' };
  }

  const productIds = validItems.map((it) => it.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, selling_price')
    .eq('business_id', access.business_id)
    .in('id', productIds);

  if (productsError) return { error: productsError.message };

  const productMap = new Map((products || []).map((p) => [p.id, p]));
  const orderItems = validItems
    .filter((it) => productMap.has(it.product_id))
    .map((it) => {
      const p = productMap.get(it.product_id)!;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: it.quantity,
        unit_price: p.selling_price || 0,
      };
    });

  if (orderItems.length === 0) {
    return { error: 'None of the selected products could be found.' };
  }

  const forDate = new Date();
  forDate.setDate(forDate.getDate() + 1);

  // Matches the reference app exactly: an add-on creates a NEW order_submissions
  // row tagged order_type='added' for the same day, rather than editing the
  // original order \u2014 keeps a clean history of what was added and when.
  const { data: submission, error: subError } = await supabase
    .from('order_submissions')
    .insert({
      business_id: access.business_id,
      customer_id: access.customer_id,
      for_date: forDate.toISOString().slice(0, 10),
      total_items: orderItems.reduce((s, it) => s + it.quantity, 0),
      order_type: 'added',
      status: 'pending',
      payment_status: 'pending',
      synced_to_sheet: false,
      notes: message?.trim() || null,
    })
    .select('id')
    .single();

  if (subError) return { error: subError.message };

  const { error: itemsError } = await supabase.from('order_submission_items').insert(
    orderItems.map((it) => ({ ...it, submission_id: submission.id }))
  );

  if (itemsError) return { error: itemsError.message };

  revalidatePath(`/order/${token}`);
  return { success: true };
}
