-- Add PDFMe template column to proposal_templates table
ALTER TABLE proposal_templates 
ADD COLUMN IF NOT EXISTS pdfme_template JSONB;