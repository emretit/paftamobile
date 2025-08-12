export interface PageSettings {
  size: "A4" | "A3" | "LETTER";
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize: number;
}

export interface HeaderSettings {
  showLogo: boolean;
  logoUrl?: string;
  title: string;
  showValidity: boolean;
}

export interface CustomerBlockSettings {
  show: boolean;
  fields: Array<"name" | "company" | "email" | "mobile_phone" | "office_phone" | "address" | "tax_number" | "tax_office">;
}

export interface ColumnSettings {
  key: string;
  label: string;
  show: boolean;
  align: "left" | "center" | "right";
}

export interface LineTableSettings {
  columns: ColumnSettings[];
}

export interface TotalsSettings {
  showGross: boolean;
  showDiscount: boolean;
  showTax: boolean;
  showNet: boolean;
}

export interface CustomTextField {
  id: string;
  label: string;
  text: string;
  position: "header" | "footer" | "before-table" | "after-table";
  style?: {
    fontSize?: number;
    align?: "left" | "center" | "right";
    bold?: boolean;
    color?: string;
  };
}

export interface NotesSettings {
  intro?: string;
  footer?: string;
  customFields?: CustomTextField[];
}

export interface TemplateSchema {
  page: PageSettings;
  header: HeaderSettings;
  customerBlock: CustomerBlockSettings;
  lineTable: LineTableSettings;
  totals: TotalsSettings;
  notes: NotesSettings;
}

export interface PdfTemplate {
  id: string;
  name: string;
  type: "quote" | "invoice" | "proposal";
  locale: "tr" | "en";
  schema_json: TemplateSchema;
  version: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QuoteData extends Record<string, unknown> {
  id?: string;
  number: string;
  title: string;
  description?: string;
  customer?: {
    name: string;
    company?: string;
    email?: string;
    mobile_phone?: string;
    office_phone?: string;
    address?: string;
    tax_number?: string;
    tax_office?: string;
  };
  employee?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  company?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    tax_office?: string;
    logo_url?: string;
    website?: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    unit?: string;
    tax_rate?: number;
    discount_rate?: number;
    total: number;
  }>;
  subtotal: number;
  total_discount?: number;
  total_tax: number;
  total_amount: number;
  currency: string;
  valid_until?: string;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_terms?: string;
  notes?: string;
  created_at: string;
}

export interface PdfExportOptions {
  templateId?: string;
  filename?: string;
  uploadToStorage?: boolean;
  storagePath?: string;
}
