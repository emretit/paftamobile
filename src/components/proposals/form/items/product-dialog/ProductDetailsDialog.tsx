import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { Product } from "@/types/product";
import { convertCurrency, getCurrentExchangeRates } from "../utils/currencyUtils";
import { Textarea } from "@/components/ui/textarea";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  quantity: number;
  setQuantity: (value: number) => void;
  customPrice: number | undefined;
  setCustomPrice: (value: number | undefined) => void;
  selectedDepo: string;
  setSelectedDepo: (value: string) => void;
  discountRate: number;
  setDiscountRate: (value: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  onSelectProduct: () => void;
  selectedCurrency: string;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedProduct,
  quantity,
  setQuantity,
  customPrice,
  setCustomPrice,
  selectedDepo,
  setSelectedDepo,
  discountRate,
  setDiscountRate,
  formatCurrency,
  onSelectProduct,
  selectedCurrency
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [stockStatus, setStockStatus] = useState("");
  const [convertedPrice, setConvertedPrice] = useState(0);
  const [notes, setNotes] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [originalCurrency, setOriginalCurrency] = useState("");

  // Update calculations when inputs change
  useEffect(() => {
    if (selectedProduct) {
      // Store original product price and currency for reference
      setOriginalPrice(selectedProduct.price);
      setOriginalCurrency(selectedProduct.currency || "TRY");
      
      // Set customPrice with the product's price if it hasn't been set manually
      setCustomPrice(selectedProduct.price);
      setConvertedPrice(selectedProduct.price);
      
      // Apply discount and calculate total
      const currentPrice = customPrice !== undefined ? customPrice : convertedPrice;
      const discountedPrice = currentPrice * (1 - discountRate / 100);
      const total = quantity * discountedPrice * (1 + (selectedProduct.tax_rate || 0) / 100);
      setTotalPrice(total);
      
      // Set stock info
      setAvailableStock(selectedProduct.stock_quantity || 0);
      
      if (selectedProduct.stock_quantity <= 0) {
        setStockStatus("out_of_stock");
      } else if (selectedProduct.stock_quantity <= (selectedProduct.stock_threshold || 0)) {
        setStockStatus("low_stock");
      } else {
        setStockStatus("in_stock");
      }
    }
  }, [selectedProduct, quantity, customPrice, discountRate, convertedPrice]);

  // Update converted price when currency changes
  useEffect(() => {
    if (selectedProduct) {
      const productCurrency = selectedProduct.currency || "TRY";
      const productPrice = selectedProduct.price;
      
      if (productCurrency !== selectedCurrency) {
        // Get current exchange rates
        const exchangeRates = getCurrentExchangeRates();
        
        const newConvertedPrice = convertCurrency(
          productPrice,
          productCurrency,
          selectedCurrency,
          exchangeRates
        );
        
        setConvertedPrice(newConvertedPrice);
        
        // Automatically update custom price when currency changes
        setCustomPrice(newConvertedPrice);
      } else {
        setConvertedPrice(productPrice);
        setCustomPrice(productPrice);
      }
    }
  }, [selectedCurrency, selectedProduct]);

  if (!selectedProduct) {
    return null;
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "Stokta Yok";
      case "low_stock":
        return "Düşük Stok";
      case "in_stock":
        return "Stokta";
      default:
        return "Bilinmiyor";
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "in_stock":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      default:
        return "";
    }
  };

  const getStockWarning = (status: string) => {
    if (status === "out_of_stock") {
      return (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>Bu ürün stokta mevcut değil. Yine de teklife ekleyebilirsiniz.</span>
        </div>
      );
    } else if (status === "low_stock") {
      return (
        <div className="mt-2 text-sm text-yellow-600 flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Bu ürün düşük stok seviyesinde.</span>
        </div>
      );
    }
    return null;
  };

  const getCurrencyName = (code: string) => {
    const currencies: Record<string, string> = {
      TRY: "Türk Lirası",
      USD: "Amerikan Doları",
      EUR: "Euro",
      GBP: "İngiliz Sterlini"
    };
    return currencies[code] || code;
  };

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      TRY: "₺",
      USD: "$",
      EUR: "€",
      GBP: "£"
    };
    return symbols[code] || code;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürün Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Product Info */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
              <Badge variant="outline" className={getStockStatusClass(stockStatus)}>
                <span className="flex items-center space-x-1">
                  {getStockStatusIcon(stockStatus)}
                  <span>{getStockStatusText(stockStatus)}</span>
                </span>
              </Badge>
            </div>
            {selectedProduct.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedProduct.description}
              </p>
            )}
            <div className="flex items-center mt-2 text-sm">
              <span className="mr-4">SKU: {selectedProduct.sku || "-"}</span>
              <span>Stok: {availableStock} {selectedProduct.unit}</span>
            </div>
            {getStockWarning(stockStatus)}
          </div>
          
          {/* Original Currency Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium mr-2">Orijinal Para Birimi:</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:border-blue-700">
                {getCurrencySymbol(originalCurrency)} {getCurrencyName(originalCurrency)}
              </Badge>
              <span className="ml-2">
                Fiyat: {formatCurrency(originalPrice, originalCurrency)}
              </span>
            </div>
          </div>
          
          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Miktar</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="depo">Depo</Label>
              <Select value={selectedDepo} onValueChange={setSelectedDepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Depo seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ana Depo">Ana Depo</SelectItem>
                  <SelectItem value="Yedek Depo">Yedek Depo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Price and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center justify-between">
                <span>Birim Fiyat</span>
                <Select 
                  value={selectedCurrency} 
                  onValueChange={(val) => window.dispatchEvent(new CustomEvent('currency-change', { detail: val }))}
                >
                  <SelectTrigger className="h-7 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">₺ TRY</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={customPrice !== undefined ? customPrice : convertedPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
              />
              {selectedProduct.currency !== selectedCurrency && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dönüştürülmüş: {formatCurrency(convertedPrice, selectedCurrency)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">İndirim Oranı (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discountRate}
                onChange={(e) => setDiscountRate(Math.min(100, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ek Notlar</Label>
            <Textarea
              id="notes"
              placeholder="Ürün için ek açıklamalar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Total Price */}
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Toplam:</span>
              <span className="font-bold">{formatCurrency(totalPrice, selectedCurrency)}</span>
            </div>
            {discountRate > 0 && (
              <div className="text-xs text-right text-muted-foreground mt-1">
                <span>İndirim: %{discountRate}</span>
              </div>
            )}
            <div className="text-xs text-right text-muted-foreground">
              <span>KDV: %{selectedProduct.tax_rate || 0}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button type="button" onClick={onSelectProduct} className="ml-2">
            Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;

function getStockStatusText(status: string) {
  switch (status) {
    case "out_of_stock":
      return "Stokta Yok";
    case "low_stock":
      return "Düşük Stok";
    case "in_stock":
      return "Stokta";
    default:
      return "Bilinmiyor";
  }
}

function getStockStatusIcon(status: string) {
  switch (status) {
    case "out_of_stock":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "low_stock":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "in_stock":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

function getStockStatusClass(status: string) {
  switch (status) {
    case "out_of_stock":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "in_stock":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    default:
      return "";
  }
}

function getStockWarning(status: string) {
  if (status === "out_of_stock") {
    return (
      <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
        <AlertCircle className="h-3 w-3" />
        <span>Bu ürün stokta mevcut değil. Yine de teklife ekleyebilirsiniz.</span>
      </div>
    );
  } else if (status === "low_stock") {
    return (
      <div className="mt-2 text-sm text-yellow-600 flex items-center space-x-1">
        <AlertTriangle className="h-3 w-3" />
        <span>Bu ürün düşük stok seviyesinde.</span>
      </div>
    );
  }
  return null;
}

function getCurrencyName(code: string) {
  const currencies: Record<string, string> = {
    TRY: "Türk Lirası",
    USD: "Amerikan Doları",
    EUR: "Euro",
    GBP: "İngiliz Sterlini"
  };
  return currencies[code] || code;
}

function getCurrencySymbol(code: string) {
  const symbols: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };
  return symbols[code] || code;
}
