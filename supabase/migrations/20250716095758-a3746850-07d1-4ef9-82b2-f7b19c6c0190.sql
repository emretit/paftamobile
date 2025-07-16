-- Add unique constraint on employee_id to prevent duplicate salary records per employee
ALTER TABLE employee_salaries 
ADD CONSTRAINT employee_salaries_employee_id_unique UNIQUE (employee_id);