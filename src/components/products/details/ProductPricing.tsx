
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface ProductPricingProps {
  unitPrice: number;
  purchasePrice: number;
  taxRate: number;
  discountRate: number;
}

const ProductPricing = ({ 
  unitPrice, 
  purchasePrice, 
  taxRate, 
  discountRate 
}: ProductPricingProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Fiyat Bilgileri
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Satış Fiyatı</label>
            <p className="mt-1 text-lg font-medium">{unitPrice} TL</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Alış Fiyatı</label>
            <p className="mt-1 text-lg font-medium">{purchasePrice || 0} TL</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">KDV Oranı</label>
            <p className="mt-1">%{taxRate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">İndirim Oranı</label>
            <p className="mt-1">%{discountRate || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricing;
