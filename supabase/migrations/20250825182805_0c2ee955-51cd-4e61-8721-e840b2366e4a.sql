-- Revert to project-based structure - fix existing policies
-- Drop organization tables and restore project functionality

-- Drop the organization tables we created
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Restore project_id columns that might have been changed
ALTER TABLE opportunities 
DROP COLUMN IF EXISTS org_id;

-- Drop ALL existing opportunity policies first
DROP POLICY IF EXISTS "opportunities_org_read" ON opportunities;
DROP POLICY IF EXISTS "opportunities_org_insert" ON opportunities;
DROP POLICY IF EXISTS "opportunities_org_update" ON opportunities;
DROP POLICY IF EXISTS "opportunities_org_delete" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_read" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_insert" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_update" ON opportunities;
DROP POLICY IF EXISTS "opportunities_project_delete" ON opportunities;

-- Recreate project-based policies for opportunities (they already exist based on error, so ensure they're correct)
CREATE POLICY "opportunities_project_read" 
ON opportunities 
FOR SELECT 
USING (project_id = current_project_id());

CREATE POLICY "opportunities_project_insert" 
ON opportunities 
FOR INSERT 
WITH CHECK (project_id = current_project_id());

CREATE POLICY "opportunities_project_update" 
ON opportunities 
FOR UPDATE 
USING (project_id = current_project_id());

CREATE POLICY "opportunities_project_delete" 
ON opportunities 
FOR DELETE 
USING (project_id = current_project_id());

-- Make sure proposals use project_id
ALTER TABLE proposals 
DROP COLUMN IF EXISTS org_id;