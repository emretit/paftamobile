-- Disable RLS for nilvera_auth table
ALTER TABLE public.nilvera_auth DISABLE ROW LEVEL SECURITY;

-- Drop the existing RLS policy
DROP POLICY IF EXISTS "Users can manage their own nilvera auth" ON public.nilvera_auth;