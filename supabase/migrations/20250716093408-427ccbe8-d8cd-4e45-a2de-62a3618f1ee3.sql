-- Add meal_allowance and transport_allowance columns to employee_salaries table
ALTER TABLE employee_salaries 
ADD COLUMN meal_allowance NUMERIC DEFAULT 0,
ADD COLUMN transport_allowance NUMERIC DEFAULT 0;