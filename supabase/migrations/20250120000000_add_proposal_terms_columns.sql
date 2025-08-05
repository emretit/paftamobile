-- Add selected terms and custom terms columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN selected_terms JSONB,
ADD COLUMN custom_terms JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.proposals.selected_terms IS 'Selected predefined terms by category (payment, pricing, warranty, delivery)';
COMMENT ON COLUMN public.proposals.custom_terms IS 'Custom terms text by category (payment, pricing, warranty, delivery)';

-- Create an index for better query performance on terms
CREATE INDEX IF NOT EXISTS idx_proposals_selected_terms ON public.proposals USING GIN (selected_terms);
CREATE INDEX IF NOT EXISTS idx_proposals_custom_terms ON public.proposals USING GIN (custom_terms);

-- Add validation for selected_terms structure
ALTER TABLE public.proposals 
ADD CONSTRAINT check_selected_terms_structure 
CHECK (
  selected_terms IS NULL OR (
    selected_terms ? 'payment' OR 
    selected_terms ? 'pricing' OR 
    selected_terms ? 'warranty' OR 
    selected_terms ? 'delivery'
  )
);

-- Add validation for custom_terms structure
ALTER TABLE public.proposals 
ADD CONSTRAINT check_custom_terms_structure 
CHECK (
  custom_terms IS NULL OR (
    custom_terms ? 'payment' OR 
    custom_terms ? 'pricing' OR 
    custom_terms ? 'warranty' OR 
    custom_terms ? 'delivery'
  )
);