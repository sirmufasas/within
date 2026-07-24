-- ============================================================
-- WITH-IN Platform — Full Schema Migration
-- Phase 1: Multi-Tenant Foundation
-- Phase 2: Subscription Platform
-- Phase 3: Inventory & Production
-- ============================================================

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.subscription_status CASCADE;
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'expired', 'suspended');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('super_admin', 'owner', 'manager', 'staff');

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled');

DROP TYPE IF EXISTS public.stock_movement_type CASCADE;
CREATE TYPE public.stock_movement_type AS ENUM ('purchase', 'sale', 'transfer', 'adjustment', 'production', 'expiry_write_off');

DROP TYPE IF EXISTS public.purchase_order_status CASCADE;
CREATE TYPE public.purchase_order_status AS ENUM ('draft', 'sent', 'partial', 'received', 'cancelled');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- User Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role DEFAULT 'staff'::public.user_role,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to businesses if not present
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'bakery',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status public.subscription_status DEFAULT 'trial'::public.subscription_status,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';

-- ============================================================
-- SUBSCRIPTION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  max_users INTEGER DEFAULT 5,
  max_products INTEGER DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'paid',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INVENTORY TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT DEFAULT 'net30',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add inventory columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'unit',
  ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.stock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.stock_locations(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  quantity DECIMAL(10,3) DEFAULT 0,
  unit TEXT DEFAULT 'unit',
  cost_price DECIMAL(10,2) DEFAULT 0,
  manufactured_date DATE,
  expiry_date DATE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.stock_batches(id) ON DELETE SET NULL,
  from_location_id UUID REFERENCES public.stock_locations(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES public.stock_locations(id) ON DELETE SET NULL,
  movement_type public.stock_movement_type NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  po_number TEXT NOT NULL,
  status public.purchase_order_status DEFAULT 'draft'::public.purchase_order_status,
  order_date DATE DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date DATE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity_ordered DECIMAL(10,3) NOT NULL,
  quantity_received DECIMAL(10,3) DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'unit',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_billing_history_business_id ON public.billing_history(business_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_business_id ON public.warehouses(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_locations_warehouse_id ON public.stock_locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON public.suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_batches_business_id ON public.stock_batches(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_batches_product_id ON public.stock_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_business_id ON public.stock_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_business_id ON public.purchase_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Handle new user signup: create user_profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Get business_id for current user
CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT business_id FROM public.business_users
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'::public.user_role
  );
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "super_admin_view_all_profiles" ON public.user_profiles;
CREATE POLICY "super_admin_view_all_profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- businesses (add super admin policy)
DROP POLICY IF EXISTS "super_admin_manage_businesses" ON public.businesses;
CREATE POLICY "super_admin_manage_businesses" ON public.businesses
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "business_users_view_own_business" ON public.businesses;
CREATE POLICY "business_users_view_own_business" ON public.businesses
  FOR SELECT TO authenticated
  USING (id = public.get_user_business_id());

DROP POLICY IF EXISTS "business_users_update_own_business" ON public.businesses;
CREATE POLICY "business_users_update_own_business" ON public.businesses
  FOR UPDATE TO authenticated
  USING (id = public.get_user_business_id())
  WITH CHECK (id = public.get_user_business_id());

-- billing_history
DROP POLICY IF EXISTS "business_users_view_billing" ON public.billing_history;
CREATE POLICY "business_users_view_billing" ON public.billing_history
  FOR SELECT TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_manage_billing" ON public.billing_history;
CREATE POLICY "super_admin_manage_billing" ON public.billing_history
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- subscription_plans (public read)
DROP POLICY IF EXISTS "anyone_view_plans" ON public.subscription_plans;
CREATE POLICY "anyone_view_plans" ON public.subscription_plans
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "super_admin_manage_plans" ON public.subscription_plans;
CREATE POLICY "super_admin_manage_plans" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- warehouses
DROP POLICY IF EXISTS "business_users_manage_warehouses" ON public.warehouses;
CREATE POLICY "business_users_manage_warehouses" ON public.warehouses
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- stock_locations
DROP POLICY IF EXISTS "business_users_manage_locations" ON public.stock_locations;
CREATE POLICY "business_users_manage_locations" ON public.stock_locations
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- suppliers
DROP POLICY IF EXISTS "business_users_manage_suppliers" ON public.suppliers;
CREATE POLICY "business_users_manage_suppliers" ON public.suppliers
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- stock_batches
DROP POLICY IF EXISTS "business_users_manage_batches" ON public.stock_batches;
CREATE POLICY "business_users_manage_batches" ON public.stock_batches
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- stock_movements
DROP POLICY IF EXISTS "business_users_manage_movements" ON public.stock_movements;
CREATE POLICY "business_users_manage_movements" ON public.stock_movements
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- purchase_orders
DROP POLICY IF EXISTS "business_users_manage_purchase_orders" ON public.purchase_orders;
CREATE POLICY "business_users_manage_purchase_orders" ON public.purchase_orders
  FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id() OR public.is_super_admin())
  WITH CHECK (business_id = public.get_user_business_id() OR public.is_super_admin());

-- purchase_order_items
DROP POLICY IF EXISTS "business_users_manage_po_items" ON public.purchase_order_items;
CREATE POLICY "business_users_manage_po_items" ON public.purchase_order_items
  FOR ALL TO authenticated
  USING (
    purchase_order_id IN (
      SELECT id FROM public.purchase_orders
      WHERE business_id = public.get_user_business_id()
    ) OR public.is_super_admin()
  )
  WITH CHECK (
    purchase_order_id IN (
      SELECT id FROM public.purchase_orders
      WHERE business_id = public.get_user_business_id()
    ) OR public.is_super_admin()
  );

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET FOR LOGOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('business-logos', 'business-logos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_logos" ON storage.objects;
CREATE POLICY "public_read_logos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "auth_upload_logos" ON storage.objects;
CREATE POLICY "auth_upload_logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "auth_update_logos" ON storage.objects;
CREATE POLICY "auth_update_logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'business-logos');

-- ============================================================
-- MOCK DATA
-- ============================================================
DO $$
DECLARE
  super_admin_uuid UUID := gen_random_uuid();
  business1_uuid UUID := gen_random_uuid();
  business2_uuid UUID := gen_random_uuid();
  owner1_uuid UUID := gen_random_uuid();
  owner2_uuid UUID := gen_random_uuid();
  warehouse1_uuid UUID := gen_random_uuid();
  warehouse2_uuid UUID := gen_random_uuid();
  location1_uuid UUID := gen_random_uuid();
  location2_uuid UUID := gen_random_uuid();
  supplier1_uuid UUID := gen_random_uuid();
  supplier2_uuid UUID := gen_random_uuid();
  product1_uuid UUID := gen_random_uuid();
  product2_uuid UUID := gen_random_uuid();
  product3_uuid UUID := gen_random_uuid();
  po1_uuid UUID := gen_random_uuid();
BEGIN
  -- Super Admin user
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    super_admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'superadmin@within.app', crypt('Within@Super2026', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Ricardo Alves', 'role', 'super_admin'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

  -- Business Owner 1 (Bakery)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    owner1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@padariasaojoao.pt', crypt('SaoJoao#2026', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Joao Silva', 'role', 'owner'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

  -- Business Owner 2 (Butchery)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    owner2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'owner@freshcuts.co.za', crypt('FreshCuts#2026', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Maria Santos', 'role', 'owner'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

  -- Update super admin role in user_profiles (trigger creates it, we update role)
  UPDATE public.user_profiles SET role = 'super_admin'::public.user_role WHERE id = super_admin_uuid;

  -- Business 1: Padaria Sao Joao (Active subscription)
  INSERT INTO public.businesses (id, slug, name, business_type, phone, primary_color, secondary_color, subscription_status, plan, is_active)
  VALUES (
    business1_uuid, 'padaria-sao-joao', 'Padaria Sao Joao', 'bakery', '+351 912 345 678',
    '#4F46E5', '#1f2937', 'active'::public.subscription_status, 'professional', true
  ) ON CONFLICT (id) DO NOTHING;

  -- Business 2: Fresh Cuts Butchery (Trial)
  INSERT INTO public.businesses (id, slug, name, business_type, phone, primary_color, secondary_color, subscription_status, plan, is_active)
  VALUES (
    business2_uuid, 'fresh-cuts-butchery', 'Fresh Cuts Butchery', 'butchery', '+27 82 555 1234',
    '#DC2626', '#1f2937', 'trial'::public.subscription_status, 'starter', true
  ) ON CONFLICT (id) DO NOTHING;

  -- Link users to businesses
  INSERT INTO public.business_users (business_id, user_id, role)
  VALUES (business1_uuid, owner1_uuid, 'owner')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.business_users (business_id, user_id, role)
  VALUES (business2_uuid, owner2_uuid, 'owner')
  ON CONFLICT DO NOTHING;

  -- Subscription plans
  INSERT INTO public.subscription_plans (name, slug, price_monthly, price_yearly, max_users, max_products, features)
  VALUES
    ('Starter', 'starter', 299, 2990, 3, 50, '["Orders", "Customers", "Basic Reports"]'::jsonb),
    ('Professional', 'professional', 599, 5990, 10, 500, '["Orders", "Customers", "Inventory", "Reports", "Multi-location"]'::jsonb),
    ('Enterprise', 'enterprise', 1299, 12990, 50, 9999, '["All features", "API Access", "Custom branding", "Priority support"]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- Billing history for business 1
  INSERT INTO public.billing_history (business_id, plan, amount, currency, status, period_start, period_end, invoice_number)
  VALUES
    (business1_uuid, 'professional', 599.00, 'ZAR', 'paid', now() - interval '2 months', now() - interval '1 month', 'INV-2026-001'),
    (business1_uuid, 'professional', 599.00, 'ZAR', 'paid', now() - interval '1 month', now(), 'INV-2026-002')
  ON CONFLICT (id) DO NOTHING;

  -- Warehouses for business 1
  INSERT INTO public.warehouses (id, business_id, name, address, is_default)
  VALUES
    (warehouse1_uuid, business1_uuid, 'Main Bakery', '12 Rua das Flores, Lisboa', true),
    (warehouse2_uuid, business1_uuid, 'Cold Storage', '12 Rua das Flores, Lisboa', false)
  ON CONFLICT (id) DO NOTHING;

  -- Stock locations
  INSERT INTO public.stock_locations (id, warehouse_id, business_id, name, description)
  VALUES
    (location1_uuid, warehouse1_uuid, business1_uuid, 'Dry Store A', 'Flour, sugar, dry goods'),
    (location2_uuid, warehouse2_uuid, business1_uuid, 'Fridge 1', 'Dairy, eggs, perishables')
  ON CONFLICT (id) DO NOTHING;

  -- Suppliers for business 1
  INSERT INTO public.suppliers (id, business_id, name, contact_name, email, phone, payment_terms)
  VALUES
    (supplier1_uuid, business1_uuid, 'Moinho Nacional', 'Carlos Ferreira', 'carlos@moinho.pt', '+351 21 555 0001', 'net30'),
    (supplier2_uuid, business1_uuid, 'Lacticinios do Norte', 'Ana Costa', 'ana@lacticinios.pt', '+351 22 555 0002', 'net15')
  ON CONFLICT (id) DO NOTHING;

  -- Products for business 1
  INSERT INTO public.products (id, business_id, name, category, sku, unit, cost_price, selling_price, reorder_level)
  VALUES
    (product1_uuid, business1_uuid, 'Farinha T65', 'Ingredients', 'FAR-T65-001', 'kg', 0.85, 1.20, 50),
    (product2_uuid, business1_uuid, 'Manteiga', 'Dairy', 'MAN-001', 'kg', 4.50, 6.00, 20),
    (product3_uuid, business1_uuid, 'Pao de Forma', 'Bread', 'PAO-FOR-001', 'unit', 0.45, 1.20, 100)
  ON CONFLICT (id) DO NOTHING;

  -- Stock batches
  INSERT INTO public.stock_batches (business_id, product_id, location_id, batch_number, quantity, unit, cost_price, manufactured_date, expiry_date, supplier_id)
  VALUES
    (business1_uuid, product1_uuid, location1_uuid, 'BATCH-2026-001', 200, 'kg', 0.85, '2026-07-01', '2027-07-01', supplier1_uuid),
    (business1_uuid, product2_uuid, location2_uuid, 'BATCH-2026-002', 50, 'kg', 4.50, '2026-07-15', '2026-08-15', supplier2_uuid),
    (business1_uuid, product3_uuid, location1_uuid, 'BATCH-2026-003', 300, 'unit', 0.45, '2026-07-20', '2026-07-27', null)
  ON CONFLICT (id) DO NOTHING;

  -- Stock movements
  INSERT INTO public.stock_movements (business_id, product_id, movement_type, quantity, unit_cost, reference, notes)
  VALUES
    (business1_uuid, product1_uuid, 'purchase'::public.stock_movement_type, 200, 0.85, 'PO-2026-001', 'Initial stock purchase'),
    (business1_uuid, product2_uuid, 'purchase'::public.stock_movement_type, 50, 4.50, 'PO-2026-001', 'Initial stock purchase'),
    (business1_uuid, product3_uuid, 'production'::public.stock_movement_type, 300, 0.45, 'PROD-2026-001', 'Daily production batch')
  ON CONFLICT (id) DO NOTHING;

  -- Purchase order
  INSERT INTO public.purchase_orders (id, business_id, supplier_id, po_number, status, order_date, expected_date, total_amount)
  VALUES
    (po1_uuid, business1_uuid, supplier1_uuid, 'PO-2026-001', 'received'::public.purchase_order_status, '2026-07-01', '2026-07-05', 170.00)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.purchase_order_items (purchase_order_id, product_id, product_name, quantity_ordered, quantity_received, unit_cost, unit)
  VALUES
    (po1_uuid, product1_uuid, 'Farinha T65', 200, 200, 0.85, 'kg')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data error: %', SQLERRM;
END $$;
