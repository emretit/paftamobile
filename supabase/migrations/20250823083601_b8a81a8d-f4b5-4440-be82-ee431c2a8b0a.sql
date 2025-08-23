-- Ensure proposals/opportunities have project_id for scoping
ALTER TABLE IF EXISTS public.proposals
  ADD COLUMN IF NOT EXISTS project_id uuid;

ALTER TABLE IF EXISTS public.opportunities
  ADD COLUMN IF NOT EXISTS project_id uuid;

-- Enforce project-scoped SELECT across all public tables that have project_id
DO $do$
DECLARE
  r record;
  p record;
BEGIN
  FOR r IN 
    SELECT n.nspname AS table_schema, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r' -- ordinary tables
      AND EXISTS (
        SELECT 1 
        FROM information_schema.columns ic
        WHERE ic.table_schema = n.nspname
          AND ic.table_name = c.relname
          AND ic.column_name = 'project_id'
      )
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.table_schema, r.table_name);

    -- Drop ALL existing SELECT policies for this table to avoid permissive reads
    FOR p IN 
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = r.table_schema
        AND tablename = r.table_name
        AND cmd = 'SELECT'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', p.policyname, r.table_schema, r.table_name);
    END LOOP;

    -- Create strict project-scoped SELECT policy
    EXECUTE format(
      'CREATE POLICY "Project-scoped read" ON %I.%I FOR SELECT USING (project_id = public.current_project_id());',
      r.table_schema, r.table_name
    );
  END LOOP;
END
$do$;
