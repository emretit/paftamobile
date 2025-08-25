-- 1) Backfill project_id on proposals from customers and employees
DO $$
BEGIN
  -- From customers
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='proposals' AND column_name='customer_id'
  ) THEN
    UPDATE public.proposals p
    SET project_id = c.project_id
    FROM public.customers c
    WHERE p.customer_id = c.id
      AND p.project_id IS NULL
      AND c.project_id IS NOT NULL;
  END IF;
  
  -- From employees
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='proposals' AND column_name='employee_id'
  ) THEN
    UPDATE public.proposals p
    SET project_id = e.project_id
    FROM public.employees e
    WHERE p.employee_id = e.id
      AND p.project_id IS NULL
      AND e.project_id IS NOT NULL;
  END IF;
END $$;

-- Backfill project_id on opportunities
DO $$
BEGIN
  -- From customers
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='opportunities' AND column_name='customer_id'
  ) THEN
    UPDATE public.opportunities o
    SET project_id = c.project_id
    FROM public.customers c
    WHERE o.customer_id = c.id
      AND o.project_id IS NULL
      AND c.project_id IS NOT NULL;
  END IF;
  
  -- From employees
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='opportunities' AND column_name='employee_id'
  ) THEN
    UPDATE public.opportunities o
    SET project_id = e.project_id
    FROM public.employees e
    WHERE o.employee_id = e.id
      AND o.project_id IS NULL
      AND e.project_id IS NOT NULL;
  END IF;
END $$;

-- 2) Update current_project_id() to fall back to header when no auth (dev support)
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
  _header_project uuid;
BEGIN
  _user_id := auth.uid();
  _header_project := NULLIF(current_setting('request.headers.x-project-id', true), '')::uuid;
  
  IF _user_id IS NOT NULL THEN
    -- Try users table
    BEGIN
      SELECT u.project_id INTO _project_id
      FROM public.users u
      WHERE u.id = _user_id
      LIMIT 1;
    EXCEPTION WHEN undefined_table THEN
      _project_id := NULL;
    END;
    IF _project_id IS NOT NULL THEN
      RETURN _project_id;
    END IF;
    
    -- Try membership
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
      RETURN _project_id;
    END IF;
  END IF;
  
  -- Fallback for dev: allow header-based project id (only enables READ when policy allows public)
  IF _header_project IS NOT NULL THEN
    RETURN _header_project;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 3) Relax READ policies to public for visibility without session; keep mutations authenticated
-- Proposals
DROP POLICY IF EXISTS "Project-scoped read" ON public.proposals;
CREATE POLICY "Project-scoped read" ON public.proposals
FOR SELECT TO public
USING (project_id = public.current_project_id());

-- Opportunities
DROP POLICY IF EXISTS "Project-scoped read" ON public.opportunities;
CREATE POLICY "Project-scoped read" ON public.opportunities
FOR SELECT TO public
USING (project_id = public.current_project_id());

-- Customers (read-only public; writes remain authenticated)
DROP POLICY IF EXISTS "Project-scoped read" ON public.customers;
CREATE POLICY "Project-scoped read" ON public.customers
FOR SELECT TO public
USING (project_id = public.current_project_id());