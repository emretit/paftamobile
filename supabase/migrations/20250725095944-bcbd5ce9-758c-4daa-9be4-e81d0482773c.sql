-- Create Veriban settings table
CREATE TABLE public.veriban_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_user_name TEXT NOT NULL,
  test_password TEXT NOT NULL,
  live_user_name TEXT,
  live_password TEXT,
  test_service_url TEXT NOT NULL DEFAULT 'https://efaturatransfer.veriban.com.tr/IntegrationService.svc',
  live_service_url TEXT NOT NULL DEFAULT 'https://efaturatransfer.veriban.com.tr/IntegrationService.svc',
  is_test_mode BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create sent invoices table
CREATE TABLE public.einvoices_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_uuid TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  transfer_file_unique_id TEXT,
  customer_vkn TEXT,
  customer_name TEXT,
  invoice_profile TEXT,
  invoice_type TEXT,
  total_amount NUMERIC,
  tax_amount NUMERIC,
  payable_amount NUMERIC,
  currency_code TEXT NOT NULL DEFAULT 'TRY',
  xml_content TEXT,
  file_name TEXT,
  transfer_state_code INTEGER NOT NULL DEFAULT 2,
  transfer_state_name TEXT,
  transfer_state_description TEXT,
  invoice_state_code INTEGER NOT NULL DEFAULT 1,
  invoice_state_name TEXT,
  invoice_state_description TEXT,
  answer_state_code INTEGER,
  answer_state_name TEXT,
  answer_type_code INTEGER,
  answer_type_name TEXT,
  envelope_identifier TEXT,
  envelope_gib_code INTEGER,
  envelope_gib_state_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create received invoices table
CREATE TABLE public.einvoices_received (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_uuid TEXT NOT NULL UNIQUE,
  invoice_number TEXT NOT NULL,
  sender_vkn TEXT,
  sender_name TEXT,
  invoice_profile TEXT,
  invoice_type TEXT,
  issue_time TIMESTAMP WITH TIME ZONE,
  line_extension_amount NUMERIC,
  allowance_total_amount NUMERIC,
  tax_exclusive_amount NUMERIC,
  tax_total_amount NUMERIC,
  payable_amount NUMERIC,
  currency_code TEXT NOT NULL DEFAULT 'TRY',
  exchange_rate NUMERIC,
  is_read BOOLEAN DEFAULT false,
  answer_type TEXT,
  answer_note TEXT,
  answer_sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update einvoice_items table to match the expected structure
ALTER TABLE public.einvoice_items 
ADD COLUMN IF NOT EXISTS invoice_id TEXT,
ADD COLUMN IF NOT EXISTS invoice_type TEXT,
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC,
ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- Enable RLS
ALTER TABLE public.veriban_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einvoices_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einvoices_received ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own Veriban settings" 
ON public.veriban_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sent invoices" 
ON public.einvoices_sent 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own received invoices" 
ON public.einvoices_received 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_veriban_settings_updated_at
  BEFORE UPDATE ON public.veriban_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_einvoices_sent_updated_at
  BEFORE UPDATE ON public.einvoices_sent
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_einvoices_received_updated_at
  BEFORE UPDATE ON public.einvoices_received
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();