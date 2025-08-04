-- Ensure we have the necessary indexes and constraints
CREATE INDEX IF NOT EXISTS idx_proposal_templates_created_at ON public.proposal_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_template_type ON public.proposal_templates(template_type);

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_proposal_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_proposal_templates_updated_at ON public.proposal_templates;
CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON public.proposal_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_templates_updated_at();