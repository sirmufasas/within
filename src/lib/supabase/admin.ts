import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This client uses the Supabase SERVICE ROLE key and must never be imported
// from a 'use client' file or exposed to the browser. It's used only in
// Server Components and Server Actions to validate a customer's portal token
// and read/write their order data, bypassing RLS intentionally (the token
// itself is the authorization check, done explicitly in code below).
//
// Requires a SUPABASE_SERVICE_ROLE_KEY environment variable — NOT prefixed
// with NEXT_PUBLIC_, so Next.js never ships it to client bundles. Add it in
// your hosting provider's environment settings (Netlify: Site settings >
// Environment variables) and in your local .env — never commit it.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL). ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to your environment — find it in ' +
      'Supabase: Project Settings > API > service_role key.'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
