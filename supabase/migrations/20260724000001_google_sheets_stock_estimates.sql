-- Each business connects their OWN Google Sheet (shared with WITH-IN's
-- service account), unlike the single-tenant reference which hardcoded two
-- spreadsheet IDs for one bakery. Sections are configurable (tab name +
-- which columns hold the product name / stock / estimate) rather than
-- hardcoded "Production"/"Freezer" + columns A/F/G, since every business's
-- sheet will be laid out differently.

CREATE TABLE IF NOT EXISTS public.google_sheet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  spreadsheet_id TEXT NOT NULL,
  spreadsheet_label TEXT,
  last_verified_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tab_name TEXT NOT NULL,
  name_column TEXT NOT NULL DEFAULT 'A',
  stock_column TEXT NOT NULL DEFAULT 'F',
  estimate_column TEXT NOT NULL DEFAULT 'G',
  header_row INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (business_id, tab_name)
);

CREATE INDEX IF NOT EXISTS idx_stock_sections_business_id ON public.stock_sections(business_id);

ALTER TABLE public.google_sheet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_users_manage_sheet_connection" ON public.google_sheet_connections;
CREATE POLICY "business_users_manage_sheet_connection" ON public.google_sheet_connections
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "business_users_manage_stock_sections" ON public.stock_sections;
CREATE POLICY "business_users_manage_stock_sections" ON public.stock_sections
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

DROP TRIGGER IF EXISTS sheet_connections_set_updated_at ON public.google_sheet_connections;
CREATE TRIGGER sheet_connections_set_updated_at
  BEFORE UPDATE ON public.google_sheet_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Configurable per-business limit on distinct products in a single customer
-- order (the reference app hardcoded this to 20 for one bakery; here it's
-- a per-business setting, NULL = unlimited).
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS max_order_products INTEGER;
