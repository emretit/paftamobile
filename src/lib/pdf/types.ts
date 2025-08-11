/**
 * PDF Template and Mapping Types
 * 
 * Type definitions for pdfme integration and field mapping
 */

export interface PdfTemplate {
  id: string;
  name: string;
  description?: string;
  template_json: any; // pdfme template structure
  field_mapping_json: FieldMapping;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FieldMapping {
  [fieldName: string]: {
    table: string;
    column: string;
    type?: 'text' | 'number' | 'date' | 'currency' | 'computed';
    format?: string; // For computed fields like date/currency formatting
    computation?: string; // For computed fields
  };
}

export interface DatabaseColumn {
  table: string;
  column: string;
  type: string;
  label: string;
}

export interface PdfField {
  name: string;
  type: string;
  required?: boolean;
}

export interface ExportData {
  [key: string]: any;
}

export interface FontFile {
  name: string;
  url: string;
  fallback?: string;
}

export interface PdfmeTemplate {
  basePdf?: string | ArrayBuffer;
  schemas: Array<{
    [fieldName: string]: {
      type: string;
      position: { x: number; y: number };
      width: number;
      height: number;
      [key: string]: any;
    };
  }>;
  sampledata?: Array<{ [key: string]: any }>;
  columns?: string[];
}