-- Fix header key path to request.header.* and set search_path for security

-- Update JWT payload decode function
CREATE OR REPLACE FUNCTION public.current_token_payload()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _token text;
  _payload jsonb;
  _hdr text;
BEGIN
  -- Read x-custom-jwt header (session token)
  BEGIN
    _hdr := current_setting('request.header.x-custom-jwt', true);
  EXCEPTION WHEN others THEN
    _hdr := NULL;
  END;

  IF _hdr IS NULL OR length(_hdr) = 0 THEN
    RETURN NULL;
  END IF;

  _token := _hdr;
  
  -- Simple session token lookup
  BEGIN
    IF _token ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      SELECT jsonb_build_object(
        'user_id', us.user_id,
        'project_id', us.project_id,
        'session_token', us.session_token
      ) INTO _payload
      FROM public.user_sessions us
      WHERE us.session_token = _token
      AND (us.expires_at IS NULL OR us.expires_at > now())
      LIMIT 1;
      
      RETURN _payload;
    END IF;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  RETURN NULL;
END;
$$;

-- Update function to get current user id
CREATE OR REPLACE FUNCTION public.current_user_id_secure()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payload jsonb;
  _hdr text;
BEGIN
  -- Try from session payload
  _payload := public.current_token_payload();
  IF _payload IS NOT NULL AND _payload ? 'user_id' THEN
    RETURN (_payload->>'user_id')::uuid;
  END IF;

  -- Fallback: X-User-ID header
  BEGIN
    _hdr := current_setting('request.header.x-user-id', true);
    IF _hdr IS NOT NULL AND length(_hdr) > 0 THEN
      RETURN _hdr::uuid;
    END IF;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  RETURN NULL;
END;
$$;

-- Update function to get current project id
CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payload jsonb;
  _hdr text;
  _user_id uuid;
  _project_id uuid;
BEGIN
  -- Try from session payload
  _payload := public.current_token_payload();
  IF _payload IS NOT NULL AND _payload ? 'project_id' THEN
    RETURN (_payload->>'project_id')::uuid;
  END IF;

  -- Fallback: X-Project-ID header
  BEGIN
    _hdr := current_setting('request.header.x-project-id', true);
    IF _hdr IS NOT NULL AND length(_hdr) > 0 THEN
      RETURN _hdr::uuid;
    END IF;
  EXCEPTION WHEN others THEN
    -- ignore
  END;

  -- Final fallback: infer from user
  _user_id := public.current_user_id_secure();
  IF _user_id IS NOT NULL THEN
    SELECT u.project_id INTO _project_id
    FROM public.users u
    WHERE u.id = _user_id
    LIMIT 1;
    RETURN _project_id;
  END IF;

  RETURN NULL;
END;
$$;