-- ============================================================
-- DRIVERS & DELIVERIES (Phase 7 - Delivery Management)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle TEXT,
  zone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'off', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-transit', 'delivered', 'failed')),
  scheduled_time TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drivers_business_id ON public.drivers(business_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_business_id ON public.deliveries(business_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON public.deliveries(driver_id);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- drivers
DROP POLICY IF EXISTS "business_users_manage_drivers" ON public.drivers;
CREATE POLICY "business_users_manage_drivers" ON public.drivers
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- deliveries
DROP POLICY IF EXISTS "business_users_manage_deliveries" ON public.deliveries;
CREATE POLICY "business_users_manage_deliveries" ON public.deliveries
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS drivers_set_updated_at ON public.drivers;
CREATE TRIGGER drivers_set_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS deliveries_set_updated_at ON public.deliveries;
CREATE TRIGGER deliveries_set_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
