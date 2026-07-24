-- Additive extension of existing production tables to support real order
-- management (status workflow, payment tracking, driver assignment) and
-- customer contact details, none of which existed in the original schema.
-- All changes are ADD COLUMN IF NOT EXISTS — nothing is renamed or dropped,
-- so any existing integration (e.g. the Google Sheet sync implied by
-- synced_to_sheet / sheet_row) keeps working unchanged.

ALTER TABLE public.order_submissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Stamp the unit price onto each order line at the time of ordering, so
-- future Reports stay historically accurate even if a product's price
-- changes later. Existing rows will have unit_price = 0 (unknown historical
-- price) — Reports falls back to the product's current price for those.
ALTER TABLE public.order_submission_items
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

CREATE INDEX IF NOT EXISTS idx_order_submissions_driver_id ON public.order_submissions(driver_id);
CREATE INDEX IF NOT EXISTS idx_order_submissions_status ON public.order_submissions(status);
