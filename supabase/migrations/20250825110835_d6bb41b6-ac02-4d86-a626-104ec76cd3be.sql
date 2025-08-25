-- 1) Robust token payload reader using custom header
CREATE OR REPLACE FUNCTION public.current_token_payload()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _token text;
  _payload jsonb;
  _hdr text;
BEGIN
  BEGIN
    _hdr := current_setting('request.headers.x-custom-jwt', true);
  EXCEPTION WHEN others THEN
    _hdr := NULL;
  END;

  IF _hdr IS NULL OR length(_hdr) = 0 THEN
    RETURN NULL;
  END IF;

  _token := _hdr;
  _payload := public.validate_jwt_token(_token);

  IF _payload ? 'error' THEN
    RETURN NULL;
  END IF;

  RETURN _payload;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- 2) Secure user and project resolvers (prefer JWT, fallback to headers/db)
CREATE OR REPLACE FUNCTION public.current_user_id_secure()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _payload jsonb;
  _uid uuid;
  _hdr text;
BEGIN
  _payload := public.current_token_payload();
  IF _payload IS NOT NULL AND _payload ? 'user_id' THEN
    RETURN (_payload->>'user_id')::uuid;
  END IF;

  -- Fallback to X-User-ID header function if available
  RETURN public.current_user_id();
END;
$$;

CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _payload jsonb;
  _proj text;
  _uid uuid;
  _pid uuid;
BEGIN
  -- Prefer project from JWT
  _payload := public.current_token_payload();
  IF _payload IS NOT NULL AND _payload ? 'project_id' THEN
    RETURN (_payload->>'project_id')::uuid;
  END IF;

  -- Fallback: header X-Project-ID
  BEGIN
    _proj := current_setting('request.headers.x-project-id', true);
  EXCEPTION WHEN others THEN
    _proj := NULL;
  END;
  IF _proj IS NOT NULL AND length(_proj) > 0 THEN
    RETURN _proj::uuid;
  END IF;

  -- Fallback: lookup via users table using current_user_id()
  _uid := public.current_user_id();
  IF _uid IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT u.project_id INTO _pid
  FROM public.users u
  WHERE u.id = _uid
  LIMIT 1;

  RETURN _pid;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- 3) BEFORE INSERT helper to auto-fill project_id when missing
CREATE OR REPLACE FUNCTION public.set_project_id_on_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.project_id IS NULL THEN
    NEW.project_id = public.current_project_id();
  END IF;
  RETURN NEW;
END;
$$;

-- 4) Enable RLS and policies for multi-tenant isolation
-- Activities
ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "activities_project_read" ON public.activities FOR SELECT USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "activities_project_insert" ON public.activities FOR INSERT WITH CHECK (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "activities_project_update" ON public.activities FOR UPDATE USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "activities_project_delete" ON public.activities FOR DELETE USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Opportunities
ALTER TABLE IF EXISTS public.opportunities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "opportunities_project_read" ON public.opportunities FOR SELECT USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "opportunities_project_insert" ON public.opportunities FOR INSERT WITH CHECK (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "opportunities_project_update" ON public.opportunities FOR UPDATE USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "opportunities_project_delete" ON public.opportunities FOR DELETE USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Proposals (table is referenced by code; ensure it exists in project)
ALTER TABLE IF EXISTS public.proposals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "proposals_project_read" ON public.proposals FOR SELECT USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "proposals_project_insert" ON public.proposals FOR INSERT WITH CHECK (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "proposals_project_update" ON public.proposals FOR UPDATE USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "proposals_project_delete" ON public.proposals FOR DELETE USING (project_id = public.current_project_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) Triggers to auto-set project_id on insert
DO $$ BEGIN
  CREATE TRIGGER set_project_id_activities
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.set_project_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_project_id_opportunities
  BEFORE INSERT ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_project_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_project_id_proposals
  BEFORE INSERT ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_project_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;