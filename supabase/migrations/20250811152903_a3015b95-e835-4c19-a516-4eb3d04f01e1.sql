-- Clean PDF templates and quotations setup
-- Drop existing conflicting tables if they exist
DROP TABLE IF EXISTS proposal_templates CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_json JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  customer_company TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX idx_templates_project_id ON public.templates(project_id);
CREATE INDEX idx_quotations_project_id ON public.quotations(project_id);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view projects they're members of" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project owners can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = id AND pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for project_members
CREATE POLICY "Users can view project members" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage members" ON public.project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid() AND pm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for templates
CREATE POLICY "Users can view templates in their projects" ON public.templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates in their projects" ON public.templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update templates in their projects" ON public.templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete templates in their projects" ON public.templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

-- RLS Policies for quotations
CREATE POLICY "Users can view quotations in their projects" ON public.quotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quotations in their projects" ON public.quotations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotations in their projects" ON public.quotations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quotations in their projects" ON public.quotations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
    )
  );

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();