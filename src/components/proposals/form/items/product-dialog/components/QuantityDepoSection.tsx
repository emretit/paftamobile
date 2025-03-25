
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuantityDepoSectionProps {
  quantity: number;
  setQuantity: (value: number) => void;
  selectedDepo: string;
  setSelectedDepo: (value: string) => void;
}

const QuantityDepoSection: React.FC<QuantityDepoSectionProps> = ({
  quantity,
  setQuantity,
  selectedDepo,
  setSelectedDepo
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Miktar</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="depo">Depo</Label>
        <Select value={selectedDepo} onValueChange={setSelectedDepo}>
          <SelectTrigger>
            <SelectValue placeholder="Depo seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ana Depo">Ana Depo</SelectItem>
            <SelectItem value="Yedek Depo">Yedek Depo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuantityDepoSection;
