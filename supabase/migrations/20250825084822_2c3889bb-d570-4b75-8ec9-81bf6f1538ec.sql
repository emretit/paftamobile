-- Remove existing triggers
DROP TRIGGER IF EXISTS set_project_id_before_insert_proposals ON proposals;
DROP TRIGGER IF EXISTS set_project_id_before_insert_opportunities ON opportunities;

-- Remove the old function
DROP FUNCTION IF EXISTS public.set_project_id_from_context();

-- Create new functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- X-User-ID header'ından user_id'yi al
  RETURN current_setting('request.headers.x-user-id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
  _project_id uuid;
BEGIN
  -- current_user_id fonksiyonundan user_id'yi al
  _user_id := public.current_user_id();
  
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- users tablosundan project_id'yi bul
  SELECT project_id INTO _project_id 
  FROM users 
  WHERE id = _user_id 
  LIMIT 1;
  
  RETURN _project_id;
END;
$$;

-- Clear existing RLS policies for key tables
DROP POLICY IF EXISTS "Users can view all opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can update opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can delete opportunities" ON opportunities;

-- Enable RLS for key tables
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies for opportunities
CREATE POLICY "Project-based access for opportunities"
ON opportunities
USING (project_id = public.current_project_id());

-- Create simplified RLS policies for proposals  
CREATE POLICY "Project-based access for proposals"
ON proposals
USING (project_id = public.current_project_id());

-- Create simplified RLS policies for activities
CREATE POLICY "Project-based access for activities"
ON activities
USING (project_id = public.current_project_id());