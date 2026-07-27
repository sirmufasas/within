-- Lets a business sync their customer list directly from a Google Sheet tab
-- (reusing the same google_sheet_connections/service-account setup as
-- stock_sections), matching the reference app's exact behavior: read a
-- name column + driver column, upsert customers by name, auto-generate a
-- unique slug for new ones.

CREATE TABLE IF NOT EXISTS public.customer_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL,
  name_column TEXT NOT NULL DEFAULT 'A',
  driver_column TEXT NOT NULL DEFAULT 'D',
  header_row INTEGER NOT NULL DEFAULT 1,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customer_sync_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_users_manage_customer_sync_config" ON public.customer_sync_config;
CREATE POLICY "business_users_manage_customer_sync_config" ON public.customer_sync_config
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());
