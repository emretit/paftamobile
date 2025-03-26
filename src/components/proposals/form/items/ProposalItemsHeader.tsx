
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

export interface ProposalItemsHeaderProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  onAddItem: () => void;
  onOpenProductDialog: () => void;
  currencyOptions: { value: string; label: string }[];
}

const ProposalItemsHeader: React.FC<ProposalItemsHeaderProps> = ({
  selectedCurrency,
  onCurrencyChange,
  onAddItem,
  onOpenProductDialog,
  currencyOptions
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <h3 className="text-base font-medium">Teklif Kalemleri</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Yeni Kalem
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenProductDialog}
          className="gap-1"
        >
          <Search className="h-4 w-4" />
          Ürün Ara
        </Button>
      </div>
    </div>
  );
};

export default ProposalItemsHeader;
