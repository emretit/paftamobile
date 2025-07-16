-- Create invoice analysis table
CREATE TABLE public.invoice_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    purchase_vat NUMERIC NOT NULL DEFAULT 0,
    sales_vat NUMERIC NOT NULL DEFAULT 0,
    vat_difference NUMERIC NOT NULL DEFAULT 0,
    purchase_invoice NUMERIC NOT NULL DEFAULT 0,
    returns_received NUMERIC NOT NULL DEFAULT 0,
    sales_invoice NUMERIC NOT NULL DEFAULT 0,
    returns_given NUMERIC NOT NULL DEFAULT 0,
    profit_loss NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, year, month)
);

-- Enable Row Level Security
ALTER TABLE public.invoice_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own invoice analysis" 
ON public.invoice_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoice analysis" 
ON public.invoice_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice analysis" 
ON public.invoice_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice analysis" 
ON public.invoice_analysis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_invoice_analysis_updated_at
BEFORE UPDATE ON public.invoice_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();