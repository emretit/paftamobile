
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ProductInventoryProps {
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  lastPurchaseDate: string | null;
  onUpdate: (updates: {
    stock_quantity?: number;
    min_stock_level?: number;
  }) => void;
}

const ProductInventory = ({ 
  stockQuantity, 
  minStockLevel,
  unit,
  supplier,
  lastPurchaseDate,
  onUpdate
}: ProductInventoryProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    stockQuantity,
    minStockLevel
  });

  const getStockStatus = () => {
    if (stockQuantity <= 0) return { label: "Stokta Yok", color: "destructive" };
    if (stockQuantity <= minStockLevel) return { label: "Kritik Stok", color: "warning" };
    return { label: "Stokta", color: "default" };
  };

  const status = getStockStatus();

  const handleSave = () => {
    onUpdate({
      stock_quantity: Number(editValues.stockQuantity),
      min_stock_level: Number(editValues.minStockLevel)
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Boxes className="h-5 w-5" />
            Stok Bilgileri
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
            <span className="text-sm text-gray-500">Stok Miktarı</span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  type="number"
                  value={editValues.stockQuantity}
                  onChange={(e) => setEditValues(prev => ({
                    ...prev,
                    stockQuantity: e.target.valueAsNumber
                  }))}
                  className="w-32 text-right"
                />
              ) : (
                <>
                  <span className="text-lg font-medium">
                    {stockQuantity} {unit}
                  </span>
                  <Badge variant={status.color as "default" | "destructive" | "warning"}>
                    {status.label}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Minimum Stok Seviyesi</span>
            {isEditing ? (
              <Input
                type="number"
                value={editValues.minStockLevel}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  minStockLevel: e.target.valueAsNumber
                }))}
                className="w-32 text-right"
              />
            ) : (
              <span>{minStockLevel} {unit}</span>
            )}
          </div>

          {supplier && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tedarikçi</span>
                <span className="font-medium">{supplier.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tedarikçi İletişim</span>
                <div className="text-right">
                  <div>{supplier.email}</div>
                  <div>{supplier.phone}</div>
                </div>
              </div>
            </>
          )}

          {lastPurchaseDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Son Alım Tarihi</span>
              <span>{format(new Date(lastPurchaseDate), 'dd.MM.yyyy')}</span>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditValues({ stockQuantity, minStockLevel });
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

export default ProductInventory;
