-- Add missing columns to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS tax_office TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;