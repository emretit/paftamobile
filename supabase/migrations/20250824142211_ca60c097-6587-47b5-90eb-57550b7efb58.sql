CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _project_id uuid;
  _user_id uuid;
BEGIN
  -- Read from headers set by the client
  _project_id := nullif(current_setting('request.headers.x-project-id', true), '')::uuid;
  _user_id := nullif(current_setting('request.headers.x-user-id', true), '')::uuid;

  -- If both headers are present and user is a member of the project, trust them
  IF _project_id IS NOT NULL AND _user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.user_projects up
      WHERE up.user_id = _user_id
        AND up.project_id = _project_id
    ) THEN
      RETURN _project_id;
    END IF;
  END IF;

  -- Fallbacks
  IF _user_id IS NOT NULL THEN
    SELECT up.project_id INTO _project_id
    FROM public.user_projects up
    WHERE up.user_id = _user_id
    ORDER BY up.created_at ASC
    LIMIT 1;

    RETURN _project_id; -- may be null if user has no project
  END IF;

  -- No user context, no project
  RETURN NULL;
END;
$$;