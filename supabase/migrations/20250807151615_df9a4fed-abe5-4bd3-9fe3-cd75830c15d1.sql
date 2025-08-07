-- Add separate columns for different types of terms to proposals table
ALTER TABLE public.proposals 
ADD COLUMN payment_terms TEXT,
ADD COLUMN delivery_terms TEXT,
ADD COLUMN warranty_terms TEXT,
ADD COLUMN price_terms TEXT,
ADD COLUMN other_terms TEXT;