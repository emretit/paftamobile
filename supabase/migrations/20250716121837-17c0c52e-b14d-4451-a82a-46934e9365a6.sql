-- Disable triggers that are automatically calculating and changing salary values
DROP TRIGGER IF EXISTS calculate_employer_costs_trigger ON public.employee_salaries;
DROP TRIGGER IF EXISTS trigger_calculate_turkish_salary_costs ON public.employee_salaries;