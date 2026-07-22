-- Migration: Customer Portal & Staff Management
-- Timestamp: 20260722140000

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.staff_status CASCADE;
CREATE TYPE public.staff_status AS ENUM ('active', 'inactive', 'on_leave');

DROP TYPE IF EXISTS public.staff_activity_type CASCADE;
CREATE TYPE public.staff_activity_type AS ENUM ('order', 'customer', 'delivery', 'inventory', 'report', 'product', 'other');

-- ============================================================
-- DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manager_name TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STAFF ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STAFF MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  role_id UUID REFERENCES public.staff_roles(id) ON DELETE SET NULL,
  staff_status public.staff_status DEFAULT 'active'::public.staff_status,
  joined_date DATE DEFAULT CURRENT_DATE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STAFF ACTIVITY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  action TEXT NOT NULL,
  activity_type public.staff_activity_type DEFAULT 'other'::public.staff_activity_type,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CUSTOMER PORTAL ACCESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  portal_token TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CUSTOMER SAVED ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (customer_id, product_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_departments_business_id ON public.departments(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_business_id ON public.staff_roles(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_business_id ON public.staff_members(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_department_id ON public.staff_members(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_business_id ON public.staff_activity_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_staff_member_id ON public.staff_activity_logs(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_access_business_id ON public.customer_portal_access(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_access_customer_id ON public.customer_portal_access(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_saved_items_customer_id ON public.customer_saved_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_saved_items_business_id ON public.customer_saved_items(business_id);

-- ============================================================
-- HELPER FUNCTION: get business_id for current user
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT bu.business_id
  FROM public.business_users bu
  WHERE bu.user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_saved_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — DEPARTMENTS
-- ============================================================
DROP POLICY IF EXISTS "business_users_manage_departments" ON public.departments;
CREATE POLICY "business_users_manage_departments"
ON public.departments FOR ALL TO authenticated
USING (business_id = public.get_user_business_id())
WITH CHECK (business_id = public.get_user_business_id());

-- ============================================================
-- RLS POLICIES — STAFF ROLES
-- ============================================================
DROP POLICY IF EXISTS "business_users_manage_staff_roles" ON public.staff_roles;
CREATE POLICY "business_users_manage_staff_roles"
ON public.staff_roles FOR ALL TO authenticated
USING (business_id = public.get_user_business_id())
WITH CHECK (business_id = public.get_user_business_id());

-- ============================================================
-- RLS POLICIES — STAFF MEMBERS
-- ============================================================
DROP POLICY IF EXISTS "business_users_manage_staff_members" ON public.staff_members;
CREATE POLICY "business_users_manage_staff_members"
ON public.staff_members FOR ALL TO authenticated
USING (business_id = public.get_user_business_id())
WITH CHECK (business_id = public.get_user_business_id());

-- ============================================================
-- RLS POLICIES — STAFF ACTIVITY LOGS
-- ============================================================
DROP POLICY IF EXISTS "business_users_view_staff_activity" ON public.staff_activity_logs;
CREATE POLICY "business_users_view_staff_activity"
ON public.staff_activity_logs FOR SELECT TO authenticated
USING (business_id = public.get_user_business_id());

DROP POLICY IF EXISTS "business_users_insert_staff_activity" ON public.staff_activity_logs;
CREATE POLICY "business_users_insert_staff_activity"
ON public.staff_activity_logs FOR INSERT TO authenticated
WITH CHECK (business_id = public.get_user_business_id());

-- ============================================================
-- RLS POLICIES — CUSTOMER PORTAL ACCESS
-- ============================================================
DROP POLICY IF EXISTS "business_users_manage_portal_access" ON public.customer_portal_access;
CREATE POLICY "business_users_manage_portal_access"
ON public.customer_portal_access FOR ALL TO authenticated
USING (business_id = public.get_user_business_id())
WITH CHECK (business_id = public.get_user_business_id());

-- ============================================================
-- RLS POLICIES — CUSTOMER SAVED ITEMS
-- ============================================================
DROP POLICY IF EXISTS "business_users_manage_saved_items" ON public.customer_saved_items;
CREATE POLICY "business_users_manage_saved_items"
ON public.customer_saved_items FOR ALL TO authenticated
USING (business_id = public.get_user_business_id())
WITH CHECK (business_id = public.get_user_business_id());

-- ============================================================
-- MOCK DATA
-- ============================================================
DO $$
DECLARE
  existing_business_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'businesses'
  ) THEN
    SELECT id INTO existing_business_id FROM public.businesses LIMIT 1;

    IF existing_business_id IS NOT NULL THEN
      -- Departments
      INSERT INTO public.departments (id, business_id, name, manager_name) VALUES
        (gen_random_uuid(), existing_business_id, 'Production', 'João Silva'),
        (gen_random_uuid(), existing_business_id, 'Sales & Orders', 'Ana Costa'),
        (gen_random_uuid(), existing_business_id, 'Delivery', 'Miguel Santos'),
        (gen_random_uuid(), existing_business_id, 'Administration', 'Sofia Ferreira')
      ON CONFLICT (id) DO NOTHING;

      -- Staff Roles
      INSERT INTO public.staff_roles (id, business_id, name, permissions) VALUES
        (gen_random_uuid(), existing_business_id, 'Manager', '["view_orders","edit_orders","view_customers","edit_customers","view_reports","manage_staff"]'::jsonb),
        (gen_random_uuid(), existing_business_id, 'Sales Rep', '["view_orders","edit_orders","view_customers"]'::jsonb),
        (gen_random_uuid(), existing_business_id, 'Driver', '["view_orders"]'::jsonb),
        (gen_random_uuid(), existing_business_id, 'Warehouse', '["view_orders","view_inventory","edit_inventory"]'::jsonb)
      ON CONFLICT (id) DO NOTHING;
    ELSE
      RAISE NOTICE 'No businesses found. Skipping staff management mock data.';
    END IF;
  ELSE
    RAISE NOTICE 'Businesses table does not exist. Skipping mock data.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
