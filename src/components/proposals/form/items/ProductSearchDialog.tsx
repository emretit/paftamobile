
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Info, X, Plus, Minus, Package, Tag, Warehouse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [selectedDepo, setSelectedDepo] = useState("Ana Depo");
  const [discountRate, setDiscountRate] = useState(0);
  
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
        
        // Add a suppliers property to each product (null for now)
        return (data || []).map(product => ({
          ...product,
          suppliers: null
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

  const handleSelectProduct = () => {
    if (selectedProduct) {
      onSelectProduct(selectedProduct, quantity, customPrice);
      onOpenChange(false);
      setDetailsDialogOpen(false);
    }
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCustomPrice(product.price);
    setQuantity(1);
    setDiscountRate(0);
    setDetailsDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  // Calculate total with discount
  const calculateTotal = () => {
    if (!customPrice) return 0;
    const total = quantity * customPrice;
    const discount = total * (discountRate / 100);
    return total - discount;
  };

  // Calculate VAT amount
  const calculateVAT = () => {
    if (!selectedProduct) return 0;
    const subtotal = calculateTotal();
    return subtotal * (selectedProduct.tax_rate / 100);
  };

  // Calculate final total with VAT
  const calculateFinalTotal = () => {
    return calculateTotal() + calculateVAT();
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedProduct?.name}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="bg-emerald-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-emerald-800 mb-1 break-all">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.description && (
                  <p className="text-sm text-emerald-700">{selectedProduct.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">Miktar</Label>
                  <div className="flex items-center mt-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={decrementQuantity}
                      className="h-8 w-8 rounded-r-none"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                      className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={incrementQuantity}
                      className="h-8 w-8 rounded-l-none"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="depo" className="text-sm font-medium">Depo</Label>
                  <Select 
                    value={selectedDepo} 
                    onValueChange={setSelectedDepo}
                  >
                    <SelectTrigger id="depo" className="w-full">
                      <SelectValue placeholder="Depo seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ana Depo">Ana Depo (8 Adet)</SelectItem>
                      <SelectItem value="Yedek Depo">Yedek Depo (3 Adet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Birim Fiyat ({selectedProduct.currency})
                  </Label>
                  <div className="relative mt-1">
                    <Input 
                      id="price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={customPrice ?? selectedProduct.price} 
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)} 
                    />
                    <div className="absolute right-3 top-3 opacity-70 text-sm">
                      {selectedProduct.currency}
                    </div>
                  </div>
                  {selectedProduct.purchase_price && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Alış: {formatCurrency(selectedProduct.purchase_price, selectedProduct.currency)}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium">İndirim Oranı (%)</Label>
                  <div className="relative mt-1">
                    <Input 
                      id="discount" 
                      type="number" 
                      min="0" 
                      max="100"
                      value={discountRate} 
                      onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)} 
                    />
                    <div className="absolute right-3 top-3 opacity-70 text-sm">
                      %
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Açıklama</Label>
                <textarea 
                  id="notes" 
                  rows={3} 
                  className="w-full mt-1 p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:border-primary"
                  placeholder="Ürün hakkında not ekleyin..."
                />
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Tutar</span>
                  <span>{formatCurrency(calculateTotal(), selectedProduct.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>KDV (%{selectedProduct.tax_rate})</span>
                  <span>{formatCurrency(calculateVAT(), selectedProduct.currency)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center font-medium">
                  <span>TOPLAM</span>
                  <span className="text-lg">{formatCurrency(calculateFinalTotal(), selectedProduct.currency)}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  onClick={handleSelectProduct}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Teklife Ekle
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductSearchDialog;
