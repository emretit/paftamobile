
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductPricingProps {
  price: number;
  discountPrice: number | null;
  currency: string;
  taxRate: number;
  onUpdate: (updates: { 
    price?: number;
    discount_price?: number | null;
    tax_rate?: number;
  }) => void;
}

const ProductPricing = ({ 
  price, 
  discountPrice, 
  currency,
  taxRate,
  onUpdate
}: ProductPricingProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    price,
    discountPrice,
    taxRate
  });

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
    onUpdate({
      price: Number(editValues.price),
      discount_price: editValues.discountPrice ? Number(editValues.discountPrice) : null,
      tax_rate: Number(editValues.taxRate)
    });
    setIsEditing(false);
  };

  return (
    <Card>
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
                  price: e.target.valueAsNumber
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
                  discountPrice: e.target.valueAsNumber
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
            <span className="text-sm text-gray-500">KDV Oranı</span>
            {isEditing ? (
              <Input
                type="number"
                value={editValues.taxRate}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  taxRate: e.target.valueAsNumber
                }))}
                className="w-32 text-right"
              />
            ) : (
              <span>%{taxRate}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Para Birimi</span>
            <span>{currency}</span>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditValues({ price, discountPrice, taxRate });
                  setIsEditing(false);
                }}
              >
                İptal
              </Button>
              <Button onClick={handleSave}>
                Kaydet
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricing;
