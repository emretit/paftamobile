-- Add employer cost fields to employee_salaries table
ALTER TABLE public.employee_salaries 
ADD COLUMN sgk_employer_rate NUMERIC DEFAULT 20.5,
ADD COLUMN unemployment_employer_rate NUMERIC DEFAULT 3.0,
ADD COLUMN accident_insurance_rate NUMERIC DEFAULT 2.0,
ADD COLUMN stamp_tax NUMERIC DEFAULT 0,
ADD COLUMN severance_provision NUMERIC DEFAULT 0,
ADD COLUMN bonus_provision NUMERIC DEFAULT 0,
ADD COLUMN total_employer_cost NUMERIC DEFAULT 0,
ADD COLUMN sgk_employer_amount NUMERIC DEFAULT 0,
ADD COLUMN unemployment_employer_amount NUMERIC DEFAULT 0,
ADD COLUMN accident_insurance_amount NUMERIC DEFAULT 0,
ADD COLUMN notes TEXT;

-- Create function to calculate employer costs
CREATE OR REPLACE FUNCTION calculate_employer_costs()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate SGK employer contribution (20.5% of gross salary)
  NEW.sgk_employer_amount = NEW.gross_salary * (NEW.sgk_employer_rate / 100);
  
  -- Calculate unemployment insurance employer contribution (3% of gross salary)
  NEW.unemployment_employer_amount = NEW.gross_salary * (NEW.unemployment_employer_rate / 100);
  
  -- Calculate accident insurance (2% of gross salary)
  NEW.accident_insurance_amount = NEW.gross_salary * (NEW.accident_insurance_rate / 100);
  
  -- Calculate total employer cost
  NEW.total_employer_cost = NEW.gross_salary + 
                           NEW.sgk_employer_amount + 
                           NEW.unemployment_employer_amount + 
                           NEW.accident_insurance_amount + 
                           COALESCE(NEW.stamp_tax, 0) + 
                           COALESCE(NEW.severance_provision, 0) + 
                           COALESCE(NEW.bonus_provision, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate employer costs
CREATE TRIGGER calculate_employer_costs_trigger
  BEFORE INSERT OR UPDATE ON public.employee_salaries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_employer_costs();

-- Add index for better performance
CREATE INDEX idx_employee_salaries_employee_effective_date 
ON public.employee_salaries(employee_id, effective_date DESC);