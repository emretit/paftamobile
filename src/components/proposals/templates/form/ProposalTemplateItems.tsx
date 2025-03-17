
import React from "react";
import { ProposalItem } from "@/types/proposal-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, DollarSign } from "lucide-react";

interface ProposalTemplateItemsProps {
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
}

const ProposalTemplateItems: React.FC<ProposalTemplateItemsProps> = ({ items, setItems }) => {
  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        quantity: 1,
        unit: "adet",
        price: 0,
        tax_rate: 18,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: field === "price" || field === "quantity" || field === "tax_rate" ? Number(value) : value };
        }
        return item;
      })
    );
  };

  const calculateItemTotal = (item: ProposalItem) => {
    return item.price * item.quantity;
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ürün ve Hizmetler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Henüz ürün eklenmemiş</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <div key={item.id} className="border p-4 rounded-md mb-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor={`item-name-${item.id}`}>Ürün/Hizmet Adı</Label>
                        <Input
                          id={`item-name-${item.id}`}
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`item-description-${item.id}`}>Açıklama</Label>
                        <Input
                          id={`item-description-${item.id}`}
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`item-quantity-${item.id}`}>Miktar</Label>
                        <Input
                          id={`item-quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`item-unit-${item.id}`}>Birim</Label>
                        <Input
                          id={`item-unit-${item.id}`}
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`item-price-${item.id}`}>Birim Fiyat (₺)</Label>
                        <Input
                          id={`item-price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`item-tax-${item.id}`}>KDV (%)</Label>
                        <Input
                          id={`item-tax-${item.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={item.tax_rate}
                          onChange={(e) => updateItem(item.id, "tax_rate", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right font-medium">
                      Toplam: {formatMoney(calculateItemTotal(item))}
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                type="button"
                variant="outline" 
                className="w-full mt-2"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Başka Ürün Ekle
              </Button>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center py-2">
                  <span>Ara Toplam:</span>
                  <span>{formatMoney(calculateSubtotal())}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalTemplateItems;
