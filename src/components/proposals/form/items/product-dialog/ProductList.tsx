
import React from "react";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
  onSelectProduct
}) => {
  if (isLoading) {
    return (
      <div className="divide-y">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-3 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Filter products based on search query
  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  if (filteredProducts.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          {searchQuery 
            ? `"${searchQuery}" ile eşleşen ürün bulunamadı.` 
            : "Görüntülenecek ürün yok."}
        </p>
      </div>
    );
  }

  const getStockStatusBadge = (product: Product) => {
    const stock = product.stock_quantity || 0;
    
    if (stock <= 0) {
      return <Badge variant="destructive">Stokta Yok</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="warning" className="bg-amber-500">Sınırlı</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-500 text-green-500">Stokta</Badge>;
    }
  };

  return (
    <div className="divide-y max-h-[400px] overflow-y-auto">
      {filteredProducts.map(product => (
        <div 
          key={product.id} 
          className="p-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3"
          onClick={() => onSelectProduct(product)}
        >
          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl text-muted-foreground">📦</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{product.name}</h4>
            <div className="flex text-xs mt-1 text-muted-foreground">
              <span className="truncate">
                {product.sku ? `SKU: ${product.sku}` : ""}
                {product.sku && product.category_id ? " • " : ""}
                {product.product_categories?.name || ""}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium">
              {formatCurrency(product.price, product.currency)}
            </div>
            <div className="mt-1">
              {getStockStatusBadge(product)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
