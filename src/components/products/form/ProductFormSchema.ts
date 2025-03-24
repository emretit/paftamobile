
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().nullable().optional().transform(val => val || ""),
  sku: z.string().nullable().optional().transform(val => val || ""),
  barcode: z.string().nullable().optional().transform(val => val || ""),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  discount_price: z.coerce.number().nullable().optional(),
  stock_quantity: z.coerce.number().min(0, "Stok miktarı 0'dan küçük olamaz"),
  min_stock_level: z.coerce.number().min(0, "Minimum stok seviyesi 0'dan küçük olamaz"),
  stock_threshold: z.coerce.number().min(0, "Stok eşiği 0'dan küçük olamaz").optional().default(0),
  tax_rate: z.coerce.number().min(0, "Vergi oranı 0'dan küçük olamaz").max(100, "Vergi oranı 100'den büyük olamaz"),
  unit: z.string(),
  is_active: z.boolean().default(true),
  currency: z.string().default("TRY"),
  category_type: z.string().default("product"),
  product_type: z.string().default("physical"),
  status: z.string().default("active"),
  image_url: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  supplier_id: z.string().nullable().optional(),
  purchase_price: z.coerce.number().min(0, "Alış fiyatı 0'dan küçük olamaz").optional(),
});

export type ProductFormSchema = z.infer<typeof productSchema>;
