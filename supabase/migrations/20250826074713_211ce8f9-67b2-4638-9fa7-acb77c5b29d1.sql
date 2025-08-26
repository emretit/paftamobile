CREATE OR REPLACE VIEW v_user_orgs AS
SELECT 
  m.user_id,
  m.org_id,
  m.role,
  o.name AS org_name
FROM org_members m
JOIN orgs o ON o.id = m.org_id;