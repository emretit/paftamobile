-- 1) Update current_project_id() to not depend on custom headers; use auth.uid() and membership
CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _project_id uuid;
  _user_id uuid;
BEGIN
  -- Use authenticated user id
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE LOG 'current_project_id: No auth user available';
    RETURN NULL;
  END IF;
  
  -- First, try users table for a direct project assignment
  BEGIN
    SELECT u.project_id INTO _project_id
    FROM public.users u
    WHERE u.id = _user_id
    LIMIT 1;
  EXCEPTION WHEN undefined_table THEN
    -- users table may not exist; ignore
    _project_id := NULL;
  END;
  
  IF _project_id IS NOT NULL THEN
    RAISE LOG 'current_project_id: Using users.project_id: % for user %', _project_id, _user_id;
    RETURN _project_id;
  END IF;
  
  -- Next, try membership via user_projects
  BEGIN
    SELECT up.project_id INTO _project_id
    FROM public.user_projects up
    WHERE up.user_id = _user_id
    ORDER BY CASE up.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END
    LIMIT 1;
  EXCEPTION WHEN undefined_table THEN
    _project_id := NULL;
  END;
  
  IF _project_id IS NOT NULL THEN
    RAISE LOG 'current_project_id: Using user_projects.project_id: % for user %', _project_id, _user_id;
    RETURN _project_id;
  END IF;
  
  RAISE LOG 'current_project_id: No project found for user %', _user_id;
  RETURN NULL;
END;
$$;

-- 2) Helper trigger to auto-fill project_id from context on INSERT
CREATE OR REPLACE FUNCTION public.set_project_id_from_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.project_id IS NULL THEN
    NEW.project_id = public.current_project_id();
  END IF;
  RETURN NEW;
END;
$$;

-- 3) Proposals: replace header-based policies with project-scoped policies using current_project_id()
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Simple project-based read" ON public.proposals;
DROP POLICY IF EXISTS "Simple project-based insert" ON public.proposals;
DROP POLICY IF EXISTS "Simple project-based update" ON public.proposals;
DROP POLICY IF EXISTS "Simple project-based delete" ON public.proposals;

-- Create consistent project-scoped policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proposals' AND policyname = 'Project-scoped read'
  ) THEN
    CREATE POLICY "Project-scoped read" ON public.proposals
    FOR SELECT TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proposals' AND policyname = 'Enable insert for project members'
  ) THEN
    CREATE POLICY "Enable insert for project members" ON public.proposals
    FOR INSERT TO authenticated
    WITH CHECK (project_id = public.current_project_id());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proposals' AND policyname = 'Enable update for project members'
  ) THEN
    CREATE POLICY "Enable update for project members" ON public.proposals
    FOR UPDATE TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'proposals' AND policyname = 'Enable delete for project members'
  ) THEN
    CREATE POLICY "Enable delete for project members" ON public.proposals
    FOR DELETE TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
END $$;

-- Ensure insert auto-sets project_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_project_id_before_insert_proposals'
  ) THEN
    CREATE TRIGGER set_project_id_before_insert_proposals
    BEFORE INSERT ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.set_project_id_from_context();
  END IF;
END $$;

-- 4) Opportunities: add project_id and apply project-scoped policies + trigger
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS project_id uuid;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Drop overly-permissive policies if any exist
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Users can view all opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view all opportunities" ON public.opportunities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Users can insert opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert opportunities" ON public.opportunities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Users can update opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update opportunities" ON public.opportunities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Users can delete opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can delete opportunities" ON public.opportunities'; END IF;
END $$;

-- Create project-scoped policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'opportunities' AND policyname = 'Project-scoped read'
  ) THEN
    CREATE POLICY "Project-scoped read" ON public.opportunities
    FOR SELECT TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'opportunities' AND policyname = 'Enable insert for project members'
  ) THEN
    CREATE POLICY "Enable insert for project members" ON public.opportunities
    FOR INSERT TO authenticated
    WITH CHECK (project_id = public.current_project_id());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'opportunities' AND policyname = 'Enable update for project members'
  ) THEN
    CREATE POLICY "Enable update for project members" ON public.opportunities
    FOR UPDATE TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'opportunities' AND policyname = 'Enable delete for project members'
  ) THEN
    CREATE POLICY "Enable delete for project members" ON public.opportunities
    FOR DELETE TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
END $$;

-- Auto-fill project_id on insert for opportunities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_project_id_before_insert_opportunities'
  ) THEN
    CREATE TRIGGER set_project_id_before_insert_opportunities
    BEFORE INSERT ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.set_project_id_from_context();
  END IF;
END $$;

-- 5) Customers: tighten to project-scoped policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop permissive policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable read for all authenticated users') THEN
    DROP POLICY "Enable read for all authenticated users" ON public.customers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable insert for all authenticated users') THEN
    DROP POLICY "Enable insert for all authenticated users" ON public.customers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable update for all authenticated users') THEN
    DROP POLICY "Enable update for all authenticated users" ON public.customers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable delete for all authenticated users') THEN
    DROP POLICY "Enable delete for all authenticated users" ON public.customers;
  END IF;

  -- Create project-scoped policies if missing
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Project-scoped read') THEN
    CREATE POLICY "Project-scoped read" ON public.customers
    FOR SELECT TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable insert for project members') THEN
    CREATE POLICY "Enable insert for project members" ON public.customers
    FOR INSERT TO authenticated
    WITH CHECK (project_id = public.current_project_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable update for project members') THEN
    CREATE POLICY "Enable update for project members" ON public.customers
    FOR UPDATE TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='Enable delete for project members') THEN
    CREATE POLICY "Enable delete for project members" ON public.customers
    FOR DELETE TO authenticated
    USING (project_id = public.current_project_id());
  END IF;
END $$;