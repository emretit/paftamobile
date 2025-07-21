export interface ParsedProduct {
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  unit: string;
  tax_rate: number;
  line_total: number;
  tax_amount?: number;
  discount_amount?: number;
}

export interface ExistingProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  category_type: string;
  stock_quantity: number;
  unit: string;
  tax_rate: number;
}

export interface ProductMapping {
  parsedProduct: ParsedProduct;
  selectedProductId: string | null;
  action: 'create' | 'update' | 'skip';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierTaxNumber: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  taxAmount: number;
  status: string;
}