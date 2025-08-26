-- Fix current_user_id function to properly extract user ID from JWT
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_id_from_jwt uuid;
  jwt_claims jsonb;
BEGIN
  -- Get JWT claims from current request
  BEGIN
    jwt_claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION
    WHEN OTHERS THEN
      jwt_claims := NULL;
  END;
  
  -- Extract user ID from 'sub' claim
  IF jwt_claims IS NOT NULL THEN
    user_id_from_jwt := (jwt_claims ->> 'sub')::uuid;
  END IF;
  
  -- If we got user ID from JWT, return it
  IF user_id_from_jwt IS NOT NULL THEN
    RETURN user_id_from_jwt;
  END IF;
  
  -- Fallback to auth.uid() for Supabase native auth
  RETURN auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN auth.uid();
END;
$function$;

-- Fix current_company_id function to use the corrected current_user_id
CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_company_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID using our fixed function
  current_user_id := public.current_user_id();
  
  -- If no user, return NULL
  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get company_id for this user
  SELECT company_id INTO user_company_id
  FROM public.users 
  WHERE id = current_user_id;
  
  RETURN user_company_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$function$;