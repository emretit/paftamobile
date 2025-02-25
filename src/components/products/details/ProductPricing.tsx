
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface ProductPricingProps {
  price: number;
  discountPrice: number | null;
  currency: string;
  taxRate: number;
}

const ProductPricing = ({ 
  price, 
  discountPrice, 
  currency,
  taxRate
}: ProductPricingProps) => {
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

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Fiyat Bilgileri
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Satış Fiyatı</span>
            <span className="text-lg font-medium">{formatPrice(price)}</span>
          </div>

          {discountPrice && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">İndirimli Fiyat</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-green-600">
                  {formatPrice(discountPrice)}
                </span>
                <Badge variant="secondary">
                  %{Math.round(calculateDiscount())} İndirim
                </Badge>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">KDV Oranı</span>
            <span>%{taxRate}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Para Birimi</span>
            <span>{currency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricing;
