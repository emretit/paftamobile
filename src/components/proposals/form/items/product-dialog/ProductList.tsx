
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { convertCurrency } from "../utils/currencyUtils";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  formatCurrency: (amount: number, currency?: string) => string;
  onSelectProduct: (product: Product) => void;
  selectedCurrency: string;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  searchQuery,
  formatCurrency,
  onSelectProduct,
  selectedCurrency
}) => {
  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.sku && product.sku.toLowerCase().includes(searchLower)) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower))
    );
  });

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return { status: "Stokta Yok", className: "text-red-500" };
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { status: "Düşük Stok", className: "text-yellow-500" };
    } else {
      return { status: "Stokta Var", className: "text-green-500" };
    }
  };

  // Convert price to selected currency for display
  const getDisplayPrice = (product: Product) => {
    if (product.currency === selectedCurrency) {
      return formatCurrency(product.price, product.currency);
    }
    
    // Use fixed exchange rates (this would be dynamic in a real app)
    const exchangeRates = {
      TRY: 1,
      USD: 32.5,
      EUR: 35.2,
      GBP: 41.3
    };
    
    const convertedPrice = convertCurrency(
      product.price,
      product.currency,
      selectedCurrency,
      exchangeRates
    );
    
    return (
      <>
        {formatCurrency(convertedPrice, selectedCurrency)}
        <span className="text-xs text-muted-foreground block">
          {formatCurrency(product.price, product.currency)}
        </span>
      </>
    );
  };

  return (
    <div className="border rounded-md">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Ürün Adı</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Stok</TableHead>
            <TableHead className="text-right">Fiyat</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Ürünler yükleniyor...
              </TableCell>
            </TableRow>
          ) : filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                {searchQuery 
                  ? `"${searchQuery}" ile eşleşen ürün bulunamadı.` 
                  : "Henüz ürün eklenmemiş."}
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => {
              const { status, className } = getStockStatus(product);
              return (
                <TableRow 
                  key={product.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell>
                    {product.product_categories?.name || "Kategori Yok"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={className}>
                      {status} ({product.stock_quantity})
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {getDisplayPrice(product)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                    >
                      Seç
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductList;
