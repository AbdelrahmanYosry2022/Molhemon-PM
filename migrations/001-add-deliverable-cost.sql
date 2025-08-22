-- Migration: add cost column to deliverables
-- Adds a nullable numeric column `cost` to store the cost of each deliverable.
-- Run this against your Postgres / Supabase database.

ALTER TABLE IF EXISTS deliverables
ADD COLUMN IF NOT EXISTS cost numeric(12,2) DEFAULT NULL;

-- Optionally update existing rows to 0.00 where needed:
-- UPDATE deliverables SET cost = 0.00 WHERE cost IS NULL;
