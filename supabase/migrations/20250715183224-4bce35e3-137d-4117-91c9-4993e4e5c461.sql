-- Create cashflow_categories table
CREATE TABLE public.cashflow_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cashflow_transactions table
CREATE TABLE public.cashflow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category_id UUID NOT NULL REFERENCES public.cashflow_categories(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  description TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cashflow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cashflow_categories
CREATE POLICY "Users can view their own categories and default categories"
  ON public.cashflow_categories FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create their own categories"
  ON public.cashflow_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories"
  ON public.cashflow_categories FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories"
  ON public.cashflow_categories FOR DELETE
  USING (user_id = auth.uid());

-- Create RLS policies for cashflow_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.cashflow_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions"
  ON public.cashflow_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions"
  ON public.cashflow_transactions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions"
  ON public.cashflow_transactions FOR DELETE
  USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_cashflow_categories_updated_at
  BEFORE UPDATE ON public.cashflow_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_cashflow_transactions_updated_at
  BEFORE UPDATE ON public.cashflow_transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('cashflow-attachments', 'cashflow-attachments', false);

-- Create storage policies
CREATE POLICY "Users can view their own attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cashflow-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cashflow-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cashflow-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cashflow-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default categories
INSERT INTO public.cashflow_categories (name, type, user_id) VALUES
-- Default expense categories
('Salary & wages', 'expense', NULL),
('Rent', 'expense', NULL),
('Utilities', 'expense', NULL),
('Office supplies', 'expense', NULL),
('Raw materials', 'expense', NULL),
('Fuel & maintenance', 'expense', NULL),
('Insurance', 'expense', NULL),
('Software licenses', 'expense', NULL),
('Taxes', 'expense', NULL),
('Consultancy', 'expense', NULL),
('Marketing', 'expense', NULL),
('Shipping', 'expense', NULL),
('Cleaning', 'expense', NULL),
('Bank fees', 'expense', NULL),
('Donations', 'expense', NULL),
('Other', 'expense', NULL),
-- Default income categories
('Product sales', 'income', NULL),
('Service sales', 'income', NULL),
('Debt collection', 'income', NULL),
('Interest', 'income', NULL),
('Refunds', 'income', NULL),
('Other', 'income', NULL);