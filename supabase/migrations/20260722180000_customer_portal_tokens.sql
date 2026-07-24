-- Enables gen_random_bytes() used to generate portal tokens.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure a portal_token can never collide (should already be effectively
-- unique in practice, but this makes it enforced rather than assumed).
DROP INDEX IF EXISTS idx_customer_portal_access_token_unique;
CREATE UNIQUE INDEX idx_customer_portal_access_token_unique
  ON public.customer_portal_access (portal_token)
  WHERE portal_token IS NOT NULL;

-- Auto-provision a customer_portal_access row (with a fresh token) whenever
-- a new customer is created, so every customer has a working order link
-- without any extra manual step.
CREATE OR REPLACE FUNCTION public.provision_customer_portal_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_portal_access (business_id, customer_id, portal_token, is_active)
  VALUES (NEW.business_id, NEW.id, encode(gen_random_bytes(24), 'hex'), true)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS customers_provision_portal_access ON public.customers;
CREATE TRIGGER customers_provision_portal_access
  AFTER INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.provision_customer_portal_access();

-- Backfill: give every existing customer a portal token if they don't
-- already have one.
INSERT INTO public.customer_portal_access (business_id, customer_id, portal_token, is_active)
SELECT c.business_id, c.id, encode(gen_random_bytes(24), 'hex'), true
FROM public.customers c
LEFT JOIN public.customer_portal_access cpa ON cpa.customer_id = c.id
WHERE cpa.id IS NULL;
