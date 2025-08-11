# React-PDF Quote Export System

## Overview
Complete PDF export system for quotations using React-PDF and Supabase storage.

## Environment Variables
Add these to your `.env.local` file:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Storage Setup

### 1. Create Documents Bucket
Run this SQL in your Supabase SQL Editor:

```sql
-- Create documents bucket (public by default)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Create RLS policies for documents bucket
CREATE POLICY "Public read access for documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

### 2. File Path Convention
PDFs are stored using the path: `quotes/{quoteNumber}.pdf`

### 3. Private vs Public Storage
- **Public storage**: Files are publicly accessible via direct URL
- **Private storage**: Files require signed URLs with 1-hour expiry

## Database Requirements

### Required Tables
Ensure these tables exist in your Supabase database:

```sql
-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  date DATE NOT NULL,
  currency TEXT DEFAULT 'TRY',
  discount DECIMAL DEFAULT 0,
  tax_rate DECIMAL DEFAULT 18,
  notes TEXT,
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company profile table
CREATE TABLE company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table (if not exists)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

### In Quote List/Table
```tsx
import QuoteExportActions from '@/components/QuoteExportActions';

// In your table row
<QuoteExportActions 
  quoteId={quote.id} 
  quoteNumber={quote.number} 
/>
```

### In Quote Detail Page
```tsx
import QuoteExportActions from '@/components/QuoteExportActions';

// In action bar
<div className="flex gap-2 items-center">
  <QuoteExportActions 
    quoteId={quote.id} 
    quoteNumber={quote.number}
    isPrivateStorage={true} // for private files
  />
</div>
```

### Testing
Visit `/dev/pdf-preview` to test the PDF generation with demo data.

## Features
- ✅ PDF download with React-PDF
- ✅ Supabase storage upload
- ✅ Public/private storage support
- ✅ Signed URLs for private files
- ✅ Error handling and loading states
- ✅ Turkish number formatting
- ✅ Company logo support
- ✅ Development fallback data

## Dependencies
- `@react-pdf/renderer` - PDF generation
- `@supabase/supabase-js` - Database and storage
- `date-fns` - Date formatting