-- Fix RLS policies for cashflow_categories table
DROP POLICY IF EXISTS "Users can create their own categories" ON public.cashflow_categories;

CREATE POLICY "Users can create their own categories" 
ON public.cashflow_categories 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);