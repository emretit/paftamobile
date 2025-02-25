
import { Card, CardContent } from "@/components/ui/card";
import { Boxes } from "lucide-react";

interface ProductInventoryProps {
  stockQuantity: number;
  stockThreshold: number;
  minOrderQuantity: number;
  maxOrderQuantity: number | null;
  unit: string;
}

const ProductInventory = ({ 
  stockQuantity, 
  stockThreshold, 
  minOrderQuantity, 
  maxOrderQuantity, 
  unit 
}: ProductInventoryProps) => {
  const stockStatus = stockQuantity <= 0 
    ? "Stokta Yok" 
    : stockQuantity <= stockThreshold 
    ? "Kritik Stok" 
    : "Stokta";

  const stockStatusColor = stockQuantity <= 0 
    ? "text-red-500" 
    : stockQuantity <= stockThreshold 
    ? "text-yellow-500" 
    : "text-green-500";

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Boxes className="h-5 w-5" />
          Stok Bilgileri
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Stok Miktarı</label>
            <p className={`mt-1 text-lg font-medium ${stockStatusColor}`}>
              {stockQuantity} {unit}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Stok Durumu</label>
            <p className={`mt-1 ${stockStatusColor}`}>{stockStatus}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Minimum Sipariş</label>
            <p className="mt-1">{minOrderQuantity || 1} {unit}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Maksimum Sipariş</label>
            <p className="mt-1">{maxOrderQuantity || "Limit yok"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInventory;
