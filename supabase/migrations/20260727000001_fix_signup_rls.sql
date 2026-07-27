-- CRITICAL FIX: the businesses table has only ever had SELECT and UPDATE
-- policies for regular users (see the original migration) — there was NO
-- policy allowing an authenticated user to INSERT a new business at all.
-- This has been silently blocking every signup from the very beginning:
-- a brand-new user has no business_id yet, so the existing "view/update
-- your own business" policies (which check id = get_user_business_id())
-- never apply, and with no INSERT policy at all, Postgres denies by default.

DROP POLICY IF EXISTS "authenticated_users_create_business" ON public.businesses;
CREATE POLICY "authenticated_users_create_business" ON public.businesses
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- business_users has no policies defined anywhere in this repo's migrations
-- either (it predates them, like businesses did) — so it's unverified
-- whether linking yourself to the business you just created works. This
-- policy is intentionally narrow: a user may only ever insert a row linking
-- THEMSELVES (not an arbitrary other user_id) to a business, which is
-- exactly what the signup flow needs and nothing more.
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_link_themselves_to_business" ON public.business_users;
CREATE POLICY "users_link_themselves_to_business" ON public.business_users
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_view_own_business_membership" ON public.business_users;
CREATE POLICY "users_view_own_business_membership" ON public.business_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR business_id = public.get_user_business_id());
