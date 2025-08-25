-- Create multi-tenant tables and RLS policies (part 2)

-- Create orgs table (equivalent to projects)
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Create org_members table for tenant membership
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  
  -- Ensure unique org+user combination
  UNIQUE(org_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON org_members(role);
CREATE INDEX IF NOT EXISTS idx_orgs_created_by ON orgs(created_by);

-- Add org_id to opportunities table if not exists
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES orgs(id);

-- Update opportunities to use org_id instead of project_id (migrate existing data)
UPDATE opportunities SET org_id = project_id WHERE org_id IS NULL AND project_id IS NOT NULL;

-- Add index on org_id for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_org_id ON opportunities(org_id);

-- Enable RLS on tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is member of org
CREATE OR REPLACE FUNCTION is_org_member(org_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_id = org_uuid 
    AND user_id = user_uuid 
    AND is_active = true
  );
$$;

-- Helper function to check if user has specific role in org
CREATE OR REPLACE FUNCTION has_org_role(org_uuid UUID, required_role user_role, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_id = org_uuid 
    AND user_id = user_uuid 
    AND role = required_role
    AND is_active = true
  );
$$;

-- Helper function to check if user has admin privileges (owner or admin role)
CREATE OR REPLACE FUNCTION has_admin_role(org_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_id = org_uuid 
    AND user_id = user_uuid 
    AND role IN ('owner', 'admin')
    AND is_active = true
  );
$$;

-- RLS Policies for orgs table
DROP POLICY IF EXISTS "Users can view orgs they are members of" ON orgs;
CREATE POLICY "Users can view orgs they are members of" ON orgs
  FOR SELECT TO authenticated
  USING (is_org_member(id));

DROP POLICY IF EXISTS "Owners can update their orgs" ON orgs;
CREATE POLICY "Owners can update their orgs" ON orgs
  FOR UPDATE TO authenticated
  USING (has_org_role(id, 'owner'));

DROP POLICY IF EXISTS "Users can create orgs" ON orgs;
CREATE POLICY "Users can create orgs" ON orgs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for org_members table
DROP POLICY IF EXISTS "Users can view their own memberships" ON org_members;
CREATE POLICY "Users can view their own memberships" ON org_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all members of their orgs" ON org_members;
CREATE POLICY "Admins can view all members of their orgs" ON org_members
  FOR SELECT TO authenticated
  USING (has_admin_role(org_id));

DROP POLICY IF EXISTS "Owners and admins can invite users" ON org_members;
CREATE POLICY "Owners and admins can invite users" ON org_members
  FOR INSERT TO authenticated
  WITH CHECK (has_admin_role(org_id));

DROP POLICY IF EXISTS "Owners and admins can update memberships" ON org_members;
CREATE POLICY "Owners and admins can update memberships" ON org_members
  FOR UPDATE TO authenticated
  USING (has_admin_role(org_id));

DROP POLICY IF EXISTS "Owners and admins can remove members" ON org_members;
CREATE POLICY "Owners and admins can remove members" ON org_members
  FOR DELETE TO authenticated
  USING (has_admin_role(org_id));

-- Update RLS Policies for opportunities table to use org-based security
DROP POLICY IF EXISTS "opportunities_project_read" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_insert" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_update" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_delete" ON opportunities;
DROP POLICY IF EXISTS "Users can view opportunities from their orgs" ON opportunities;
DROP POLICY IF EXISTS "Members can create opportunities in their orgs" ON opportunities;
DROP POLICY IF EXISTS "Admins can update opportunities in their orgs" ON opportunities;
DROP POLICY IF EXISTS "Admins can delete opportunities in their orgs" ON opportunities;

CREATE POLICY "Users can view opportunities from their orgs" ON opportunities
  FOR SELECT TO authenticated
  USING (is_org_member(org_id));

CREATE POLICY "Members can create opportunities in their orgs" ON opportunities
  FOR INSERT TO authenticated
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Admins can update opportunities in their orgs" ON opportunities
  FOR UPDATE TO authenticated
  USING (has_admin_role(org_id));

CREATE POLICY "Admins can delete opportunities in their orgs" ON opportunities
  FOR DELETE TO authenticated
  USING (has_admin_role(org_id));

-- Add trigger to automatically create org membership when user creates org
CREATE OR REPLACE FUNCTION create_org_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO org_members (org_id, user_id, role, created_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_create_org_owner ON orgs;
CREATE TRIGGER trigger_create_org_owner
  AFTER INSERT ON orgs
  FOR EACH ROW
  EXECUTE FUNCTION create_org_owner_membership();

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_orgs_updated_at ON orgs;
CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_members_updated_at ON org_members;
CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();