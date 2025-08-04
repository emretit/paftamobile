-- Create proposal_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.proposal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'standard',
  design_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for proposal templates
CREATE POLICY "Users can view all proposal templates" 
ON public.proposal_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own proposal templates" 
ON public.proposal_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own proposal templates" 
ON public.proposal_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own proposal templates" 
ON public.proposal_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create default template
INSERT INTO public.proposal_templates (name, description, template_type, design_settings, created_by)
VALUES (
  'Varsayılan Şablon',
  'Standart PDF şablonu',
  'standard',
  '{
    "pageSize": "A4",
    "orientation": "portrait",
    "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20},
    "header": {
      "enabled": true,
      "height": 60,
      "logoPosition": "left",
      "logoSize": "medium",
      "showCompanyInfo": true,
      "backgroundColor": "transparent",
      "textColor": "#000000"
    },
    "footer": {
      "enabled": true,
      "height": 20,
      "showPageNumbers": false,
      "showContactInfo": false,
      "backgroundColor": "transparent",
      "textColor": "#888888"
    },
    "colors": {
      "primary": "#0f172a",
      "secondary": "#64748b",
      "accent": "#3b82f6",
      "text": "#000000",
      "background": "#ffffff",
      "border": "#e2e8f0"
    },
    "fonts": {
      "primary": "helvetica",
      "secondary": "helvetica",
      "sizes": {"title": 24, "heading": 12, "body": 10, "small": 8}
    },
    "table": {
      "headerBackground": "#475569",
      "headerText": "#ffffff",
      "rowAlternating": true,
      "borderColor": "#e2e8f0",
      "borderWidth": 0.1
    },
    "layout": {
      "spacing": "normal",
      "showBorders": false,
      "roundedCorners": false,
      "shadowEnabled": false
    },
    "branding": {
      "companyName": "Şirket Adı"
    },
    "sections": [
      {"id": "1", "type": "header", "title": "Başlık", "enabled": true, "order": 1, "settings": {}},
      {"id": "2", "type": "proposal-info", "title": "Teklif Bilgileri", "enabled": true, "order": 2, "settings": {}},
      {"id": "3", "type": "customer-info", "title": "Müşteri Bilgileri", "enabled": true, "order": 3, "settings": {}},
      {"id": "4", "type": "items-table", "title": "Ürün/Hizmet Tablosu", "enabled": true, "order": 4, "settings": {}},
      {"id": "5", "type": "totals", "title": "Toplam", "enabled": true, "order": 5, "settings": {}},
      {"id": "6", "type": "terms", "title": "Şartlar", "enabled": true, "order": 6, "settings": {}},
      {"id": "7", "type": "footer", "title": "Alt Bilgi", "enabled": true, "order": 7, "settings": {}}
    ]
  }'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;