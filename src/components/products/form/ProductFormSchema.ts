
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  stock_quantity: z.coerce.number().min(0, "Stok miktarı 0'dan küçük olamaz"),
  unit: z.string().min(1, "Birim zorunludur"),
  tax_rate: z.coerce.number().min(0, "Vergi oranı 0'dan küçük olamaz").max(100, "Vergi oranı 100'den büyük olamaz"),
  currency: z.string().min(1, "Para birimi zorunludur"),
  product_type: z.string().min(1, "Ürün tipi zorunludur"),
  is_active: z.boolean(),
  // Optional fields
  description: z.string().nullable().optional().transform(val => val || ""),
  sku: z.string().nullable().optional().transform(val => val || ""),
  barcode: z.string().nullable().optional().transform(val => val || ""),
  discount_price: z.coerce.number().nullable().optional(),
  min_stock_level: z.coerce.number().min(0, "Minimum stok seviyesi 0'dan küçük olamaz").optional().default(0),
  stock_threshold: z.coerce.number().min(0, "Stok eşiği 0'dan küçük olamaz").optional().default(0),
  exchange_rate: z.coerce.number().optional(),
  category_type: z.string().optional().default("product"),
  status: z.string().optional().default("active"),
  image_url: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  supplier_id: z.string().nullable().optional(),
  purchase_price: z.coerce.number().nullable().optional(),
});

export type ProductFormSchema = z.infer<typeof productSchema>;
