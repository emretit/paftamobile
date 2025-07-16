-- employee_salaries tablosundaki RLS politikalarını kaldır
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON employee_salaries;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON employee_salaries;

-- RLS'yi tamamen kapat
ALTER TABLE employee_salaries DISABLE ROW LEVEL SECURITY;