-- Create documents storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for documents bucket
CREATE POLICY "Public read access for documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Create quotes table if it doesn't exist (for PDF export system)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT DEFAULT 'TRY',
  discount DECIMAL DEFAULT 0,
  tax_rate DECIMAL DEFAULT 18,
  notes TEXT,
  customer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quote_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_profile table if it doesn't exist  
CREATE TABLE IF NOT EXISTS company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table if it doesn't exist (referenced by quotes)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for customer_id in quotes table
ALTER TABLE quotes 
ADD CONSTRAINT fk_quotes_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id)
ON DELETE SET NULL;