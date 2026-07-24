-- Add phone column to user_profiles so the Profile page's "phone" field
-- (which the app already tries to save) actually has somewhere to persist.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;
