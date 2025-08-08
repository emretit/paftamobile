-- Add is_active flag to proposal_templates and ensure a single active template
-- Create column if it doesn't exist
ALTER TABLE public.proposal_templates
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

-- Create helper function to ensure only one active template at a time
CREATE OR REPLACE FUNCTION public.ensure_single_active_template()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.proposal_templates
    SET is_active = false
    WHERE id <> NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert
DROP TRIGGER IF EXISTS trg_single_active_template_ins ON public.proposal_templates;
CREATE TRIGGER trg_single_active_template_ins
BEFORE INSERT ON public.proposal_templates
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_active_template();

-- Trigger on update
DROP TRIGGER IF EXISTS trg_single_active_template_upd ON public.proposal_templates;
CREATE TRIGGER trg_single_active_template_upd
BEFORE UPDATE ON public.proposal_templates
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_active_template();
