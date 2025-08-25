-- 003-add-deliverable-typography.sql
-- Add the new 'typography' deliverable type to the database-level CHECK constraint
-- WARNING: run this against your Postgres/Supabase database. Backup before applying.

BEGIN;

-- Drop existing constraint if present (safe to run repeatedly)
ALTER TABLE public.deliverables DROP CONSTRAINT IF EXISTS deliverables_type_check;

-- Recreate the constraint including the new 'typography' value.
ALTER TABLE public.deliverables
  ADD CONSTRAINT deliverables_type_check CHECK (
    type IN (
      'podcast', 'short-video', 'long-video', 'course', 'cover', 'book',
      'branding', 'logo', 'web', 'wordpress', 'typography'
    )
  );

COMMIT;

-- Notes:
-- If your schema or table is namespaced differently, adjust `public.deliverables` accordingly.
-- If you'd rather not change the DB, you can map the client-side 'typography' to an
-- existing allowed type before insert (temporary workaround).
