-- Create cashflow_main table for comprehensive cashflow management
CREATE TABLE public.cashflow_main (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  main_category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month, main_category, subcategory)
);

-- Enable RLS
ALTER TABLE public.cashflow_main ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own cashflow data"
ON public.cashflow_main
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_cashflow_main_updated_at
BEFORE UPDATE ON public.cashflow_main
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_cashflow_main_user_year_month ON public.cashflow_main(user_id, year, month);
CREATE INDEX idx_cashflow_main_category ON public.cashflow_main(main_category, subcategory);