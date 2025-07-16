-- Add manual employer SGK cost field to employee_salaries table
ALTER TABLE public.employee_salaries 
ADD COLUMN manual_employer_sgk_cost numeric DEFAULT 0;