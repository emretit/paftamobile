-- Enable RLS on the new tables and add basic policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotes table
CREATE POLICY "Users can view quotes" ON quotes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create quotes" ON quotes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quotes" ON quotes
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete quotes" ON quotes
FOR DELETE USING (auth.role() = 'authenticated');

-- RLS policies for quote_items table
CREATE POLICY "Users can view quote items" ON quote_items
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create quote items" ON quote_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quote items" ON quote_items
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete quote items" ON quote_items
FOR DELETE USING (auth.role() = 'authenticated');

-- RLS policies for company_profile table (public read, authenticated write)
CREATE POLICY "Anyone can view company profile" ON company_profile
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create company profile" ON company_profile
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company profile" ON company_profile
FOR UPDATE USING (auth.role() = 'authenticated');