'use server';

import { createAdminClient } from '@/lib/supabase/admin';

interface AssistantResult {
  answer?: string;
  error?: string;
}

// Read-only by design: the assistant answers questions from real data below,
// and is explicitly told it cannot place, change, or cancel orders. It never
// gets write access to anything — it's a Q&A layer, not an ordering agent.
export async function askAssistant(token: string, question: string): Promise<AssistantResult> {
  if (!question.trim()) return { error: 'Ask me something first.' };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: 'The assistant isn\u2019t set up yet \u2014 ask your supplier to add an API key.' };
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

  const [businessRes, customerRes, curatedRes, historyRes] = await Promise.all([
    supabase.from('businesses').select('name').eq('id', access.business_id).single(),
    supabase.from('customers').select('name').eq('id', access.customer_id).single(),
    supabase
      .from('customer_products')
      .select('products ( name, category, unit, selling_price, is_active )')
      .eq('customer_id', access.customer_id),
    supabase
      .from('order_submissions')
      .select('for_date, status, order_submission_items ( product_name, quantity )')
      .eq('customer_id', access.customer_id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const productLines = (curatedRes.data || [])
    .map((r: any) => r.products)
    .filter((p: any) => p && p.is_active)
    .map((p: any) => `- ${p.name} (${p.category || 'uncategorised'}) \u2014 R${Number(p.selling_price || 0).toFixed(2)} per ${p.unit || 'unit'}`)
    .join('\n');

  const historyLines = (historyRes.data || [])
    .map((o: any) => {
      const items = (o.order_submission_items || [])
        .map((it: any) => `${it.quantity}x ${it.product_name}`)
        .join(', ');
      return `- Ordered for ${o.for_date}, status: ${o.status}. Items: ${items || 'none'}`;
    })
    .join('\n');

  const businessName = businessRes.data?.name || 'your supplier';
  const customerName = customerRes.data?.name || 'there';

  const systemPrompt = `You are a helpful order-support assistant for ${customerName}, a wholesale customer of ${businessName}.

RULES:
- Only answer using the information provided below. Never invent products, prices, or order details.
- You CANNOT place, change, or cancel an order. If asked to do any of that, politely direct them to use the order form on this same page, or to contact ${businessName} directly.
- Keep answers short and friendly.

Their available products:
${productLines || 'No products are currently assigned to this account.'}

Their 5 most recent orders:
${historyLines || 'No orders placed yet.'}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    });

    if (!response.ok) {
      console.error('Assistant API error:', response.status, await response.text());
      return { error: 'Sorry, I couldn\u2019t process that right now. Please try again shortly.' };
    }

    const data = await response.json();
    const answer = data.content?.find((b: { type: string }) => b.type === 'text')?.text
      || 'Sorry, I didn\u2019t understand that \u2014 could you rephrase?';
    return { answer };
  } catch (err) {
    console.error('Assistant call failed:', err);
    return { error: 'Sorry, I couldn\u2019t process that right now. Please try again shortly.' };
  }
}
