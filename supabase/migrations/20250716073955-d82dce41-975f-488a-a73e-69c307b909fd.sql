-- Add calculate_as_minimum_wage column to employee_salaries table
ALTER TABLE public.employee_salaries 
ADD COLUMN calculate_as_minimum_wage boolean DEFAULT false;

-- Add salary_input_type column to track whether net or gross was entered
ALTER TABLE public.employee_salaries 
ADD COLUMN salary_input_type text DEFAULT 'gross' CHECK (salary_input_type IN ('gross', 'net'));

-- Add comment for clarity
COMMENT ON COLUMN public.employee_salaries.calculate_as_minimum_wage IS 'When true, employer costs are calculated based on minimum wage instead of actual gross salary';
COMMENT ON COLUMN public.employee_salaries.salary_input_type IS 'Indicates whether the salary was entered as gross or net amount';