-- Backfill missing project_id in opportunities, activities and proposals 
-- Use the first available project_id from users table as default

DO $$
DECLARE
  default_project_id uuid;
  backfill_count integer;
BEGIN
  -- Get a default project_id from users table
  SELECT project_id INTO default_project_id 
  FROM public.users 
  WHERE project_id IS NOT NULL 
  LIMIT 1;
  
  -- If no project_id found in users, use the hardcoded default
  IF default_project_id IS NULL THEN
    default_project_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  
  -- Backfill opportunities
  UPDATE public.opportunities 
  SET project_id = default_project_id 
  WHERE project_id IS NULL;
  
  GET DIAGNOSTICS backfill_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % opportunities with project_id %', backfill_count, default_project_id;
  
  -- Backfill activities  
  UPDATE public.activities 
  SET project_id = default_project_id 
  WHERE project_id IS NULL;
  
  GET DIAGNOSTICS backfill_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % activities with project_id %', backfill_count, default_project_id;
  
  -- Backfill proposals (if table exists)
  UPDATE public.proposals 
  SET project_id = default_project_id 
  WHERE project_id IS NULL;
  
  GET DIAGNOSTICS backfill_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % proposals with project_id %', backfill_count, default_project_id;
  
END $$;