-- Fix RLS policies for cashflow_categories table
DROP POLICY IF EXISTS "Users can create their own categories" ON public.cashflow_categories;

CREATE POLICY "Users can create their own categories" 
ON public.cashflow_categories 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Also fix the WITH CHECK on INSERT for cashflow_transactions
CREATE POLICY IF NOT EXISTS "Users can create their own transactions" 
ON public.cashflow_transactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());