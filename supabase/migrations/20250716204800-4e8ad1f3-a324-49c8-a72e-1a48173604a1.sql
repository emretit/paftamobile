-- Remove auth-dependent RLS policies from invoice_analysis table
DROP POLICY IF EXISTS "Users can create their own invoice analysis" ON public.invoice_analysis;
DROP POLICY IF EXISTS "Users can delete their own invoice analysis" ON public.invoice_analysis;  
DROP POLICY IF EXISTS "Users can update their own invoice analysis" ON public.invoice_analysis;
DROP POLICY IF EXISTS "Users can view their own invoice analysis" ON public.invoice_analysis;

-- Create new permissive policies that allow all access without authentication
CREATE POLICY "Allow all access to invoice analysis" 
ON public.invoice_analysis 
FOR ALL 
USING (true) 
WITH CHECK (true);