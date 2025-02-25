
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes } from "lucide-react";

interface ProductInventoryProps {
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
}

const ProductInventory = ({ 
  stockQuantity, 
  minStockLevel,
  unit
}: ProductInventoryProps) => {
  const getStockStatus = () => {
    if (stockQuantity <= 0) return { label: "Stokta Yok", color: "destructive" };
    if (stockQuantity <= minStockLevel) return { label: "Kritik Stok", color: "warning" };
    return { label: "Stokta", color: "default" };
  };

  const status = getStockStatus();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Boxes className="h-5 w-5" />
          Stok Bilgileri
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Stok Miktarı</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                {stockQuantity} {unit}
              </span>
              <Badge variant={status.color as "default" | "destructive" | "warning"}>
                {status.label}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Minimum Stok Seviyesi</span>
            <span>{minStockLevel} {unit}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Birim</span>
            <span className="capitalize">{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInventory;
