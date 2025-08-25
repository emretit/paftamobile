-- JWT tabanlı kullanıcı ve proje kimliği fonksiyonlarını güncelle

-- JWT payload decode fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION public.current_token_payload()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  _token text;
  _payload jsonb;
  _hdr text;
BEGIN
  -- x-custom-jwt header'ını oku
  BEGIN
    _hdr := current_setting('request.headers.x-custom-jwt', true);
  EXCEPTION WHEN others THEN
    _hdr := NULL;
  END;

  -- Debug log
  RAISE LOG 'JWT Header: %', _hdr;

  IF _hdr IS NULL OR length(_hdr) = 0 THEN
    RAISE LOG 'No JWT header found';
    RETURN NULL;
  END IF;

  _token := _hdr;
  
  -- Simple JWT decode (gerçek JWT değil, basit token)
  BEGIN
    -- Token'ı uuid olarak parse et
    IF _token ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      -- Session token, user_sessions tablosundan bilgileri al
      SELECT jsonb_build_object(
        'user_id', us.user_id,
        'project_id', us.project_id,
        'session_token', us.session_token
      ) INTO _payload
      FROM public.user_sessions us
      WHERE us.session_token = _token
      AND us.expires_at > now();
      
      RAISE LOG 'Session payload: %', _payload;
      RETURN _payload;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE LOG 'JWT decode error: %', SQLERRM;
    RETURN NULL;
  END;

  RETURN NULL;
END;
$$;

-- Kullanıcı ID fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION public.current_user_id_secure()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  _payload jsonb;
  _user_id uuid;
  _hdr text;
BEGIN
  -- Önce JWT'den al
  _payload := public.current_token_payload();
  IF _payload IS NOT NULL AND _payload ? 'user_id' THEN
    RETURN (_payload->>'user_id')::uuid;
  END IF;

  -- Fallback: X-User-ID header'ından al
  BEGIN
    _hdr := current_setting('request.headers.x-user-id', true);
    IF _hdr IS NOT NULL AND length(_hdr) > 0 THEN
      RETURN _hdr::uuid;
    END IF;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  RETURN NULL;
END;
$$;

-- Proje ID fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  _payload jsonb;
  _project_id uuid;
  _hdr text;
  _user_id uuid;
BEGIN
  -- Önce JWT'den al
  _payload := public.current_token_payload();
  IF _payload IS NOT NULL AND _payload ? 'project_id' THEN
    RETURN (_payload->>'project_id')::uuid;
  END IF;

  -- Fallback: X-Project-ID header'ından al
  BEGIN
    _hdr := current_setting('request.headers.x-project-id', true);
    IF _hdr IS NOT NULL AND length(_hdr) > 0 THEN
      RETURN _hdr::uuid;
    END IF;
  EXCEPTION WHEN others THEN
    -- Ignore error
  END;

  -- Son fallback: user_id'den proje bul
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