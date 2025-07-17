-- Create invoices storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true);

-- Create storage policy for invoices bucket
CREATE POLICY "Users can view invoice PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'invoices');

CREATE POLICY "Authenticated users can upload invoice PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own invoice PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');