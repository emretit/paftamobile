
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  formatted_description?: any; // Making it optional with ?
  sku: string | null;
  barcode: string | null;
  price: number;
  discount_price: number | null;
  currency: string;
  tax_rate: number;
  stock_quantity: number;
  min_stock_level: number;
  stock_threshold?: number;
  unit: string;
  category_id: string;
  category_type: string;
  product_type: string;
  status: string;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  last_purchase_date?: string | null; // Making it optional with ?
  related_products?: string[]; // Making it optional with ?
  product_categories: ProductCategory | null;
  suppliers: Supplier | null;
  purchase_price?: number;
}
