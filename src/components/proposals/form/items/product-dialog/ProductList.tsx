
import React from "react";
import { Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  formatCurrency: (amount: number, currency?: string) => string;
  onSelectProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  searchQuery,
  formatCurrency,
  onSelectProduct,
}) => {
  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="col-span-2 py-4 text-center text-muted-foreground">
        Ürünler yükleniyor...
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="col-span-2 py-4 text-center text-muted-foreground">
        Ürün bulunamadı
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
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
                  <Package className="h-6 w-6" />
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
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectProduct(product)}
                className="ml-2 whitespace-nowrap"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectProduct(product)}
                className="ml-2 whitespace-nowrap"
              >
                Seç
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProductList;
