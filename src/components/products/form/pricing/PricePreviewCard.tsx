
import { Card } from "@/components/ui/card";
import { formatPrice, calculateTax, calculateDiscount } from "../../utils/priceUtils";

interface PricePreviewCardProps {
  price: number;
  discountPrice: number | null;
  taxRate: number;
  currency: string;
}

const PricePreviewCard = ({ 
  price, 
  discountPrice, 
  taxRate, 
  currency 
}: PricePreviewCardProps) => {
  return (
    <Card className="p-6 bg-muted/50 flex flex-col justify-center space-y-6">
      <h3 className="text-lg font-semibold text-center mb-2">
        Fiyat Önizleme
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Satış Fiyatı:</span>
          <span className="font-medium">{formatPrice(price, currency)}</span>
        </div>
        
        {discountPrice !== null && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">İndirimli Fiyat:</span>
              <span className="font-medium text-green-600">{formatPrice(discountPrice, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">İndirim Oranı:</span>
              <span className="font-medium">%{Math.round(calculateDiscount(price, discountPrice))}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">KDV Tutarı:</span>
          <span className="font-medium">{formatPrice(calculateTax(discountPrice || price, taxRate), currency)}</span>
        </div>
        
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="font-medium">KDV Dahil Fiyat:</span>
          <span className="font-bold">
            {formatPrice((discountPrice || price) + calculateTax(discountPrice || price, taxRate), currency)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PricePreviewCard;
