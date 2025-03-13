
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProposalItem } from "@/types/proposal-form";
import { useProposalItems } from "./items/useProposalItems";
import ProposalItemsHeader from "./items/ProposalItemsHeader";
import ProposalItemsTable from "./items/ProposalItemsTable";
import ProductSearchDialog from "./items/ProductSearchDialog";
import { 
  CURRENCY_OPTIONS, 
  TAX_RATE_OPTIONS 
} from "./items/proposalItemsConstants";
import { Product } from "@/types/product";

interface ProposalItemsSectionProps {
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
}

const ProposalItemsSection = ({ items, setItems }: ProposalItemsSectionProps) => {
  const {
    selectedCurrency,
    productDialogOpen,
    setProductDialogOpen,
    formatCurrency,
    handleCurrencyChange,
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange,
  } = useProposalItems();

  const onOpenProductDialog = () => setProductDialogOpen(true);
  const onAddItem = () => handleAddItem(items, setItems);
  
  const onItemChange = (index: number, field: keyof ProposalItem, value: string | number) => {
    handleItemChange(index, field, value, items, setItems);
  };
  
  const onRemoveItem = (index: number) => {
    handleRemoveItem(index, items, setItems);
  };
  
  const onSelectProduct = (product: Product) => {
    handleSelectProduct(product, items, setItems);
  };

  return (
    <div className="mt-8">
      <ProposalItemsHeader 
        selectedCurrency={selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
        onAddItem={onAddItem}
        onOpenProductDialog={onOpenProductDialog}
        currencyOptions={CURRENCY_OPTIONS}
      />

      <Card>
        <CardContent className="p-0">
          <ProposalItemsTable
            items={items}
            handleItemChange={onItemChange}
            handleRemoveItem={onRemoveItem}
            selectedCurrency={selectedCurrency}
            formatCurrency={formatCurrency}
            currencyOptions={CURRENCY_OPTIONS}
            taxRateOptions={TAX_RATE_OPTIONS}
          />
        </CardContent>
      </Card>

      <ProductSearchDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelectProduct={onSelectProduct}
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default ProposalItemsSection;
