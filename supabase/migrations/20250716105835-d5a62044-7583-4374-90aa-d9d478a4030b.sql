-- Add new columns to employee_salaries table for accurate Turkish tax calculations
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS sgk_employee_rate numeric DEFAULT 14.0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS sgk_employee_amount numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS unemployment_employee_rate numeric DEFAULT 1.0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS unemployment_employee_amount numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS income_tax_amount numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS stamp_tax_rate numeric DEFAULT 0.759;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS stamp_tax_amount numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS total_deductions numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS cumulative_yearly_gross numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS cumulative_yearly_tax numeric DEFAULT 0;
ALTER TABLE public.employee_salaries ADD COLUMN IF NOT EXISTS tax_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Update the calculate_employer_costs function for accurate Turkish calculations
CREATE OR REPLACE FUNCTION public.calculate_turkish_salary_costs()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    sgk_employee_calc numeric;
    unemployment_employee_calc numeric;
    stamp_tax_calc numeric;
    total_deductions_calc numeric;
BEGIN
    -- Calculate employee deductions
    NEW.sgk_employee_amount = NEW.gross_salary * (NEW.sgk_employee_rate / 100);
    NEW.unemployment_employee_amount = NEW.gross_salary * (NEW.unemployment_employee_rate / 100);
    NEW.stamp_tax_amount = NEW.gross_salary * (NEW.stamp_tax_rate / 100);
    
    -- Calculate employer costs (existing logic)
    NEW.sgk_employer_amount = NEW.gross_salary * (NEW.sgk_employer_rate / 100);
    NEW.unemployment_employer_amount = NEW.gross_salary * (NEW.unemployment_employer_rate / 100);
    NEW.accident_insurance_amount = NEW.gross_salary * (NEW.accident_insurance_rate / 100);
    
    -- Calculate total deductions (will be updated with income tax in application)
    NEW.total_deductions = NEW.sgk_employee_amount + NEW.unemployment_employee_amount + NEW.stamp_tax_amount + COALESCE(NEW.income_tax_amount, 0);
    
    -- Calculate net salary after all deductions
    NEW.net_salary = NEW.gross_salary - NEW.total_deductions;
    
    -- Calculate total employer cost
    NEW.total_employer_cost = NEW.gross_salary + 
                             NEW.sgk_employer_amount + 
                             NEW.unemployment_employer_amount + 
                             NEW.accident_insurance_amount + 
                             COALESCE(NEW.meal_allowance, 0) +
                             COALESCE(NEW.transport_allowance, 0) +
                             COALESCE(NEW.stamp_tax_amount, 0) + 
                             COALESCE(NEW.severance_provision, 0) + 
                             COALESCE(NEW.bonus_provision, 0);
    
    RETURN NEW;
END;
$function$;

-- Create trigger for Turkish salary calculations
DROP TRIGGER IF EXISTS trigger_calculate_turkish_salary_costs ON public.employee_salaries;
CREATE TRIGGER trigger_calculate_turkish_salary_costs
    BEFORE INSERT OR UPDATE ON public.employee_salaries
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_turkish_salary_costs();