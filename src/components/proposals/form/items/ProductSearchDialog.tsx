
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Info } from "lucide-react";
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
import { Label } from "@/components/ui/label";

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProduct: (product: Product, quantity?: number, customPrice?: number) => void;
  selectedCurrency: string;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  initialSelectedProduct?: Product | null;
}

const ProductSearchDialog = ({ 
  open, 
  onOpenChange, 
  onSelectProduct,
  selectedCurrency,
  triggerRef,
  initialSelectedProduct = null
}: ProductSearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);
  
  // Update selectedProduct when initialSelectedProduct changes or when dialog opens
  useEffect(() => {
    if (open && initialSelectedProduct) {
      setSelectedProduct(initialSelectedProduct);
      setCustomPrice(initialSelectedProduct.price);
      // If we have an initial product, open the details dialog automatically
      setDetailsDialogOpen(true);
    }
  }, [open, initialSelectedProduct]);
  
  // Fetch products from Supabase
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_categories(*)")
          .order("name");
        
        if (error) throw error;
        
        // Ensure each product has a suppliers property (even if null)
        return (data || []).map(product => ({
          ...product,
          suppliers: product.suppliers || null
        }));
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

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product, quantity, customPrice);
    onOpenChange(false);
    setDetailsDialogOpen(false);
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCustomPrice(product.price);
    setQuantity(1);
    setDetailsDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  return (
    <>
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
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openProductDetails(product)}
                        className="ml-2 whitespace-nowrap"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProductDetails(product)}
                        className="ml-2 whitespace-nowrap"
                      >
                        Seç
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ürün Detayları</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
                
                {/* Product details - left column */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-medium">{selectedProduct.sku || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Barkod</p>
                    <p className="font-medium">{selectedProduct.barcode || "-"}</p>
                  </div>
                  
                  {/* Price fields */}
                  <div>
                    <p className="text-sm text-muted-foreground">Satış Fiyatı</p>
                    <p className="font-medium">{formatCurrency(selectedProduct.price, selectedProduct.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alış Fiyatı</p>
                    <p className="font-medium">{selectedProduct.purchase_price ? formatCurrency(selectedProduct.purchase_price, selectedProduct.currency) : "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Stok</p>
                    <p className="font-medium">{selectedProduct.stock_quantity} {selectedProduct.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vergi Oranı</p>
                    <p className="font-medium">%{selectedProduct.tax_rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kategori</p>
                    <p className="font-medium">{selectedProduct.product_categories?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durum</p>
                    <p className="font-medium capitalize">{selectedProduct.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                {/* Product image */}
                {selectedProduct.image_url ? (
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name} 
                    className="w-full h-64 object-contain rounded border"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted rounded flex items-center justify-center text-muted-foreground">
                    Görsel Yok
                  </div>
                )}
                
                {/* Quantity and custom price inputs */}
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <Label htmlFor="quantity">Adet</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Birim Fiyat ({selectedProduct.currency})</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={customPrice ?? selectedProduct.price} 
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-auto">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => setDetailsDialogOpen(false)}
                  >
                    Kapat
                  </Button>
                  <Button 
                    onClick={() => handleSelectProduct(selectedProduct)}
                  >
                    Teklife Ekle
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductSearchDialog;

