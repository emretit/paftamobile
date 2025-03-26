import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Check, Info, Tag, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDebounce } from "@/hooks/useDebounce";
import { getCurrencyOptions } from "../utils/currencyUtils";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import ProductDetailsDialog from "./ProductDetailsDialog";

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect?: (product: Product) => void;
  currentCurrency: string;
}

const ProductSearchDialog: React.FC<ProductSearchDialogProps> = ({
  open,
  onOpenChange,
  onProductSelect,
  currentCurrency
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { formatCurrency } = useExchangeRates();
  const currencyOptions = getCurrencyOptions();

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedCategory(null);
    }
  }, [open]);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", debouncedSearchTerm, selectedCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from("products")
          .select("*, product_categories(*)");
        
        if (debouncedSearchTerm) {
          query = query.ilike("name", `%${debouncedSearchTerm}%`);
        }
        
        if (selectedCategory) {
          query = query.eq("category_id", selectedCategory);
        }
        
        const { data, error } = await query.order("name");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    enabled: open,
  });

  // Fetch product categories
  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("product_categories")
          .select("*")
          .order("name");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    enabled: open,
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleAddProduct = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
      onOpenChange(false);
    }
  };

  const getStockStatusColor = (product: Product) => {
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      return "text-red-500";
    }
    if (product.stock_quantity <= (product.stock_threshold || 0)) {
      return "text-yellow-500";
    }
    return "text-green-500";
  };

  const getStockStatusText = (product: Product) => {
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      return "Stokta Yok";
    }
    if (product.stock_quantity <= (product.stock_threshold || 0)) {
      return "Düşük Stok";
    }
    return "Stokta";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Ürün Ara</DialogTitle>
            <DialogDescription>
              Teklife eklemek istediğiniz ürünü seçin
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 my-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ürün adı ile ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
                  Tüm Ürünler
                </TabsTrigger>
                <TabsTrigger value="categories">Kategoriler</TabsTrigger>
              </TabsList>
              
              {selectedCategory && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs"
                >
                  Kategori Filtresini Kaldır
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
            
            <TabsContent value="all" className="flex-1 min-h-0">
              <ProductList
                products={products}
                isLoading={isLoading}
                onProductClick={handleProductClick}
                onAddProduct={handleAddProduct}
                getStockStatusColor={getStockStatusColor}
                getStockStatusText={getStockStatusText}
                formatCurrency={formatCurrency}
                searchTerm={debouncedSearchTerm}
              />
            </TabsContent>
            
            <TabsContent value="categories" className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    // Switch back to all products tab but with category filter
                    document.querySelector('[data-value="all"]')?.click();
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.description || "Kategori açıklaması yok"}
                    </span>
                  </div>
                </Button>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {selectedProduct && (
        <ProductDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          product={selectedProduct}
          onAddProduct={handleAddProduct}
          selectedCurrency={currentCurrency}
        />
      )}
    </>
  );
};

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  getStockStatusColor: (product: Product) => string;
  getStockStatusText: (product: Product) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  searchTerm: string;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  onProductClick,
  onAddProduct,
  getStockStatusColor,
  getStockStatusText,
  formatCurrency,
  searchTerm
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Ürün Bulunamadı</h3>
        <p className="text-muted-foreground text-center mt-2">
          {searchTerm
            ? `"${searchTerm}" aramasına uygun ürün bulunamadı.`
            : "Hiç ürün bulunamadı. Lütfen farklı bir arama terimi deneyin."}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1 p-1">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-start justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h4 className="text-sm font-medium truncate">{product.name}</h4>
                {product.product_categories && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {product.product_categories.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <span className="truncate">{product.description || "Açıklama yok"}</span>
                <Separator orientation="vertical" className="mx-2 h-3" />
                <span className={getStockStatusColor(product)}>
                  <Tag className="h-3 w-3 mr-1 inline" />
                  {getStockStatusText(product)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end ml-4">
              <div className="text-sm font-medium">
                {formatCurrency(product.price || 0, product.currency || "TRY")}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddProduct(product);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProductSearchDialog;
