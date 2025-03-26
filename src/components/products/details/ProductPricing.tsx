
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit2, Check, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ProductPricingProps {
  price: number;
  discountPrice: number | null;
  currency: string;
  taxRate: number;
  purchasePrice?: number | null;
  onUpdate: (updates: {
    price?: number;
    discount_price?: number | null;
    tax_rate?: number;
    currency?: string;
    purchase_price?: number | null;
  }) => void;
}

const ProductPricing = ({ 
  price, 
  discountPrice, 
  currency,
  taxRate,
  purchasePrice,
  onUpdate
}: ProductPricingProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    price,
    discountPrice,
    taxRate,
    currency,
    purchasePrice: purchasePrice || null
  });

  // Update edit values when props change
  useEffect(() => {
    if (!isEditing) {
      setEditValues({
        price,
        discountPrice,
        taxRate,
        currency,
        purchasePrice: purchasePrice || null
      });
    }
  }, [price, discountPrice, taxRate, currency, purchasePrice, isEditing]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const calculateDiscount = () => {
    if (!discountPrice || price === 0) return 0;
    return ((price - discountPrice) / price) * 100;
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Check for valid values
    if (editValues.price < 0) {
      toast.error("Fiyat 0'dan küçük olamaz");
      setIsSaving(false);
      return;
    }

    // Prepare update data
    const updateData = {
      price: Number(editValues.price),
      discount_price: editValues.discountPrice ? Number(editValues.discountPrice) : null,
      tax_rate: Number(editValues.taxRate),
      currency: editValues.currency,
      purchase_price: editValues.purchasePrice ? Number(editValues.purchasePrice) : null
    };

    onUpdate(updateData);
    setIsEditing(false);
    setIsSaving(false);
    toast.success("Fiyat bilgileri güncellendi");
  };

  const currencyOptions = [
    { value: "TRY", label: "Türk Lirası (TRY)" }
  ];
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fiyat Bilgileri
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Satış Fiyatı</span>
            {isEditing ? (
              <Input
                type="number"
                value={editValues.price}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  price: e.target.valueAsNumber || 0
                }))}
                className="w-32 text-right"
              />
            ) : (
              <span className="text-lg font-medium">{formatPrice(price)}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">İndirimli Fiyat</span>
            {isEditing ? (
              <Input
                type="number"
                value={editValues.discountPrice || ''}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  discountPrice: e.target.value ? e.target.valueAsNumber : null
                }))}
                className="w-32 text-right"
              />
            ) : discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-green-600">
                  {formatPrice(discountPrice)}
                </span>
                <Badge variant="secondary">
                  %{Math.round(calculateDiscount())} İndirim
                </Badge>
              </div>
            ) : (
              <span>-</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Alış Fiyatı</span>
            {isEditing ? (
              <Input
                type="number"
                value={editValues.purchasePrice || ''}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  purchasePrice: e.target.value ? e.target.valueAsNumber : null
                }))}
                className="w-32 text-right"
              />
            ) : purchasePrice ? (
              <span className="text-lg font-medium">{formatPrice(purchasePrice)}</span>
            ) : (
              <span>-</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">KDV Oranı</span>
            {isEditing ? (
              <Select 
                value={String(editValues.taxRate)}
                onValueChange={(value) => setEditValues(prev => ({
                  ...prev,
                  taxRate: parseInt(value)
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="KDV Oranı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">%0</SelectItem>
                  <SelectItem value="1">%1</SelectItem>
                  <SelectItem value="8">%8</SelectItem>
                  <SelectItem value="10">%10</SelectItem>
                  <SelectItem value="18">%18</SelectItem>
                  <SelectItem value="20">%20</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span>%{taxRate}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Para Birimi</span>
            {isEditing ? (
              <Select
                value={editValues.currency}
                onValueChange={(value) => setEditValues(prev => ({
                  ...prev,
                  currency: value
                }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Para birimi seç" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  {currency}
                </Badge>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditValues({ 
                    price, 
                    discountPrice, 
                    taxRate, 
                    currency,
                    purchasePrice: purchasePrice || null,
                  });
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" /> İptal
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" /> Kaydet
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricing;
