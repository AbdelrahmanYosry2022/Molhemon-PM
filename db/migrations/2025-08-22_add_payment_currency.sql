-- Migration: add currency and exchange_rate to payments
BEGIN;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EGP';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS exchange_rate numeric;

COMMIT;

-- Backfill example: set exchange_rate to 1 for existing EGP rows
-- UPDATE public.payments SET exchange_rate = 1 WHERE currency = 'EGP' AND exchange_rate IS NULL;
