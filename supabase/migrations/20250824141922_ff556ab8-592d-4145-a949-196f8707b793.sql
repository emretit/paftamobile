-- current_project_id fonksiyonunu user_projects tablosuna göre güncelleyelim
CREATE OR REPLACE FUNCTION public.current_project_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_id uuid;
  user_id uuid;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- First try to get from header (for API calls)
  project_id := nullif(current_setting('request.headers.x-project-id', true), '')::uuid;
  
  IF project_id IS NOT NULL THEN
    -- Verify user has access to this project
    IF EXISTS (
      SELECT 1 FROM public.user_projects 
      WHERE user_id = user_projects.user_id 
      AND project_id = user_projects.project_id
    ) THEN
      RETURN project_id;
    END IF;
  END IF;
  
  -- Fallback: get user's primary project from user_projects
  SELECT user_projects.project_id INTO project_id
  FROM public.user_projects
  WHERE user_projects.user_id = user_id
  ORDER BY created_at ASC
  LIMIT 1;
  
  RETURN project_id;
END;
$$;

-- profiles tablosu için RLS politikaları ekleyelim
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- profiles için okuma politikası - kullanıcı kendi profile'ını veya aynı projedeki diğer kullanıcıları görebilir
CREATE POLICY "Users can view profiles in their projects" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_projects up1
    JOIN public.user_projects up2 ON up1.project_id = up2.project_id
    WHERE up1.user_id = auth.uid() AND up2.user_id = profiles.id
  )
);

-- profiles için güncelleme politikası - kullanıcı sadece kendi profile'ını güncelleyebilir
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- user_projects tablosu için RLS politikaları
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their project memberships" ON public.user_projects
FOR SELECT USING (user_id = auth.uid());

-- projects tablosu için RLS politikaları
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their projects" ON public.projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_projects
    WHERE user_projects.project_id = projects.id
    AND user_projects.user_id = auth.uid()
  )
);

-- projects için insert politikası
CREATE POLICY "Users can create projects" ON public.projects
FOR INSERT WITH CHECK (true);

-- projects için update politikası - sadece owner'lar güncelleyebilir
CREATE POLICY "Project owners can update projects" ON public.projects
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_projects
    WHERE user_projects.project_id = projects.id
    AND user_projects.user_id = auth.uid()
    AND user_projects.role = 'owner'
  )
);

-- user_projects için insert politikası
CREATE POLICY "Users can add project members" ON public.user_projects
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_projects
    WHERE user_projects.project_id = user_projects.project_id
    AND user_projects.user_id = auth.uid()
    AND user_projects.role IN ('owner', 'admin')
  ) OR user_id = auth.uid()
);