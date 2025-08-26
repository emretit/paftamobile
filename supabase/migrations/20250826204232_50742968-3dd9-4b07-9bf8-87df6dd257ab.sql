-- Update current_user_id() to prefer custom_user_id from JWT user_metadata
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  jwt_claims jsonb;
  custom_user_id uuid;
BEGIN
  -- Read JWT claims if available
  BEGIN
    jwt_claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    jwt_claims := NULL;
  END;

  -- Prefer custom_user_id embedded by edge function into Supabase JWT
  IF jwt_claims IS NOT NULL AND (jwt_claims ? 'user_metadata') THEN
    custom_user_id := NULLIF((jwt_claims -> 'user_metadata' ->> 'custom_user_id'), '')::uuid;
    IF custom_user_id IS NOT NULL THEN
      RETURN custom_user_id;
    END IF;
  END IF;

  -- Otherwise, no reliable mapping -> return NULL to keep policies safe
  RETURN NULL;
END;
$function$;

-- Ensure current_company_id keeps using current_user_id()
CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_company_id UUID;
  app_user_id UUID;
BEGIN
  app_user_id := public.current_user_id();
  IF app_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT company_id INTO user_company_id
  FROM public.users 
  WHERE id = app_user_id;

  RETURN user_company_id;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;