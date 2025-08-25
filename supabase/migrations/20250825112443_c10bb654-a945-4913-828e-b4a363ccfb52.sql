-- Improve RLS policies for opportunities to tolerate missing current_project_id() by falling back to header-based user project

-- Read policy
ALTER POLICY "opportunities_project_read"
ON public.opportunities
USING (
  project_id = COALESCE(
    public.current_project_id(),
    (SELECT project_id FROM public.users WHERE id = public.current_user_id())
  )
);

-- Insert policy
ALTER POLICY "opportunities_project_insert"
ON public.opportunities
WITH CHECK (
  project_id = COALESCE(
    public.current_project_id(),
    (SELECT project_id FROM public.users WHERE id = public.current_user_id())
  )
);

-- Update policy
ALTER POLICY "opportunities_project_update"
ON public.opportunities
USING (
  project_id = COALESCE(
    public.current_project_id(),
    (SELECT project_id FROM public.users WHERE id = public.current_user_id())
  )
);

-- Delete policy
ALTER POLICY "opportunities_project_delete"
ON public.opportunities
USING (
  project_id = COALESCE(
    public.current_project_id(),
    (SELECT project_id FROM public.users WHERE id = public.current_user_id())
  )
);