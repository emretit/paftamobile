-- Create PDF templates table and storage setup
CREATE TABLE public.pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_json JSONB NOT NULL,
  field_mapping_json JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own templates" ON public.pdf_templates
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own templates" ON public.pdf_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON public.pdf_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON public.pdf_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Create storage buckets for PDF assets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('pdf-fonts', 'pdf-fonts', true),
  ('pdf-templates', 'pdf-templates', true);

-- Storage policies for pdf-fonts bucket
CREATE POLICY "Anyone can view pdf fonts" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-fonts');

CREATE POLICY "Authenticated users can upload pdf fonts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdf-fonts' AND auth.role() = 'authenticated');

-- Storage policies for pdf-templates bucket  
CREATE POLICY "Anyone can view pdf template files" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-templates');

CREATE POLICY "Authenticated users can upload pdf template files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdf-templates' AND auth.role() = 'authenticated');

-- Update trigger for pdf_templates
CREATE OR REPLACE FUNCTION update_pdf_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pdf_templates_updated_at
  BEFORE UPDATE ON public.pdf_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_pdf_templates_updated_at();