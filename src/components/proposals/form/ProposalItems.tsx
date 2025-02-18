
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { ProposalItem } from "@/types/proposal-form";

interface ProposalItemsProps {
  items: ProposalItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof ProposalItem, value: string | number) => void;
}

const ProposalItems = ({ items, onAddItem, onRemoveItem, onUpdateItem }: ProposalItemsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teklif Kalemleri</h3>
        <Button onClick={onAddItem} type="button">
          <Plus className="w-4 h-4 mr-2" />
          Kalem Ekle
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-6 gap-4 items-start p-4 border rounded-lg">
            <div className="col-span-2">
              <Label>Ürün/Hizmet Adı</Label>
              <Input
                value={item.name}
                onChange={(e) => onUpdateItem(item.id, "name", e.target.value)}
                placeholder="Ürün/hizmet adı"
              />
            </div>
            <div>
              <Label>Miktar</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdateItem(item.id, "quantity", e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label>Birim Fiyat</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) => onUpdateItem(item.id, "unitPrice", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>KDV Oranı (%)</Label>
              <Input
                type="number"
                value={item.taxRate}
                onChange={(e) => onUpdateItem(item.id, "taxRate", e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemoveItem(item.id)}
                className="mt-6"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProposalItems;
