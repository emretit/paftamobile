
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProposalItemsHeaderProps {
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
  onAddItem: () => void;
  onOpenProductDialog: () => void;
  currencyOptions: { value: string; label: string }[];
}

const ProposalItemsHeader = ({
  selectedCurrency,
  onCurrencyChange,
  onAddItem,
  onOpenProductDialog,
  currencyOptions,
}: ProposalItemsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Label className="text-base font-medium">Ürünler ve Hizmetler</Label>
      <div className="flex space-x-2 items-center">
        <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Para Birimi" />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          type="button" 
          size="sm"
          onClick={onOpenProductDialog}
        >
          <Search className="h-4 w-4 mr-2" />
          Ürün Ekle
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Manuel Ekle
        </Button>
      </div>
    </div>
  );
};

export default ProposalItemsHeader;
