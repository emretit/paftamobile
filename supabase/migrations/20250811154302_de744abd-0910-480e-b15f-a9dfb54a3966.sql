-- Update existing pdf_templates table to add field mapping support
ALTER TABLE public.pdf_templates 
ADD COLUMN IF NOT EXISTS field_mapping_json JSONB DEFAULT '{}'::jsonb;

-- Rename columns to match our interface
ALTER TABLE public.pdf_templates 
RENAME COLUMN template_data TO template_json;