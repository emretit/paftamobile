-- Update customers table to use UUID for representative instead of text
-- First, add a new column for the UUID reference
ALTER TABLE public.customers ADD COLUMN representative_id UUID;

-- Add foreign key constraint to employees table
ALTER TABLE public.customers 
ADD CONSTRAINT fk_customers_representative 
FOREIGN KEY (representative_id) REFERENCES public.employees(id);

-- Update existing data: match text names to employee IDs
UPDATE public.customers 
SET representative_id = (
  SELECT e.id 
  FROM public.employees e 
  WHERE CONCAT(e.first_name, ' ', e.last_name) = customers.representative
  LIMIT 1
)
WHERE customers.representative IS NOT NULL AND customers.representative != '';

-- Drop the old text column
ALTER TABLE public.customers DROP COLUMN representative;

-- Rename the new column to representative
ALTER TABLE public.customers RENAME COLUMN representative_id TO representative;