ALTER TABLE milestones
ADD COLUMN budget NUMERIC,
ADD COLUMN deliverable_ids UUID[];
