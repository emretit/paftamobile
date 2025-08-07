-- Disable RLS on proposal_templates table
ALTER TABLE public.proposal_templates DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users full access to proposal templates" ON public.proposal_templates;