
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProduct: (product: Product) => void;
  selectedCurrency: string;
}

const ProductSearchDialog = ({ 
  open, 
  onOpenChange, 
  onSelectProduct,
  selectedCurrency
}: ProductSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch products from Supabase
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_categories(*), suppliers(*)")
          .order("name");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
  });

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectProduct = (product: any) => {
    // Create a product object that conforms to our Product interface
    const selectedProduct: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      formatted_description: product.formatted_description || null,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price || 0,
      discount_price: product.discount_price,
      currency: product.currency || "TRY",
      tax_rate: product.tax_rate || 18,
      stock_quantity: product.stock_quantity || 0,
      min_stock_level: product.min_stock_level || 0,
      unit: product.unit || "piece",
      category_id: product.category_id || "",
      category_type: product.category_type || "product",
      product_type: product.product_type || "physical",
      status: product.status || "active",
      is_active: product.is_active !== undefined ? product.is_active : true,
      image_url: product.image_url,
      created_at: product.created_at,
      updated_at: product.updated_at,
      last_purchase_date: product.last_purchase_date || null,
      related_products: product.related_products || [],
      product_categories: product.product_categories,
      suppliers: product.suppliers,
      purchase_price: product.purchase_price,
    };
    
    onSelectProduct(selectedProduct);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ürün Seçimi</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ürün adı, SKU veya barkoda göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {isLoading ? (
              <div className="col-span-2 py-4 text-center text-muted-foreground">
                Ürünler yükleniyor...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-2 py-4 text-center text-muted-foreground">
                Ürün bulunamadı
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded hover:bg-muted/40 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                        No img
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span>SKU: {product.sku || "-"}</span>
                        <span>Fiyat: {formatCurrency(product.price || 0, product.currency)}</span>
                        <span>Stok: {product.stock_quantity || 0}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectProduct(product)}
                    className="ml-2 whitespace-nowrap"
                  >
                    Seç
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearchDialog;
