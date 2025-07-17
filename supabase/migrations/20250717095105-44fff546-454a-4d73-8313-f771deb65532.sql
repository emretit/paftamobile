-- Create table for storing e-invoice data
CREATE TABLE public.einvoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_tax_number TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue', 'cancelled')),
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  nilvera_id TEXT UNIQUE,
  pdf_url TEXT,
  xml_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for storing Nilvera authentication tokens
CREATE TABLE public.nilvera_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.einvoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nilvera_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for einvoices
CREATE POLICY "Users can view their own einvoices" 
ON public.einvoices 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own einvoices" 
ON public.einvoices 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own einvoices" 
ON public.einvoices 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own einvoices" 
ON public.einvoices 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for nilvera_auth
CREATE POLICY "Users can view their own auth tokens" 
ON public.nilvera_auth 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auth tokens" 
ON public.nilvera_auth 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auth tokens" 
ON public.nilvera_auth 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_einvoices_created_by ON public.einvoices(created_by);
CREATE INDEX idx_einvoices_status ON public.einvoices(status);
CREATE INDEX idx_einvoices_invoice_date ON public.einvoices(invoice_date);
CREATE INDEX idx_einvoices_nilvera_id ON public.einvoices(nilvera_id);
CREATE INDEX idx_nilvera_auth_user_id ON public.nilvera_auth(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_einvoices_updated_at
BEFORE UPDATE ON public.einvoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nilvera_auth_updated_at
BEFORE UPDATE ON public.nilvera_auth
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();