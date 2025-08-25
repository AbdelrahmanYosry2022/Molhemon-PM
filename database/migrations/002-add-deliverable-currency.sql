-- Migration: add currency column to deliverables
-- Adds a short currency code (e.g. 'EGP', 'USD') to each deliverable.

ALTER TABLE IF EXISTS deliverables
ADD COLUMN IF NOT EXISTS currency varchar(8) DEFAULT 'EGP';

-- Optionally set currency for existing rows:
-- UPDATE deliverables SET currency = 'EGP' WHERE currency IS NULL;
