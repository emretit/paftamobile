
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";
import { ProposalItem } from "@/types/proposal";
import { Product } from "@/types/product";
import { useProposalItems } from "./useProposalItems";
import ProductDetailsDialog from "./product-dialog/ProductDetailsDialog";

interface ProposalItemsProps {
  items: ProposalItem[];
  onItemsChange: (items: ProposalItem[]) => void;
  globalCurrency?: string;
}

export const ProposalItems = ({
  items,
  onItemsChange,
  globalCurrency
}: ProposalItemsProps) => {
  const {
    selectedCurrency,
    setSelectedCurrency,
    productDialogOpen,
    setProductDialogOpen,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol,
    handleCurrencyChange,
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange,
    updateAllItemsCurrency,
    convertCurrency,
    products,
    isLoading,
    setItems
  } = useProposalItems();

  // If a global currency is provided, use it to initialize
  React.useEffect(() => {
    if (globalCurrency && globalCurrency !== selectedCurrency) {
      setSelectedCurrency(globalCurrency);
      // Update all items to use this currency
      const updatedItems = updateAllItemsCurrency(globalCurrency);
      onItemsChange(updatedItems);
    }
  }, [globalCurrency, selectedCurrency]);

  const addItem = () => {
    const newItems = handleAddItem();
    onItemsChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = handleRemoveItem(id);
    onItemsChange(newItems);
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    const newItems = handleItemChange(id, field, value);
    onItemsChange(newItems);
  };

  const formatMoney = (amount: number, currency: string = selectedCurrency) => {
    return formatCurrency(amount, currency);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + Number(item.total_price), 0);
  };

  const handleProductSelect = (product: Product) => {
    const newItems = handleSelectProduct(product);
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Teklif Kalemleri</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setProductDialogOpen(true)}
            size="sm"
            variant="outline"
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Ürün Ekle
          </Button>
          <Button onClick={addItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Manuel Ekle
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Ürün/Hizmet</TableHead>
              <TableHead>Adet</TableHead>
              <TableHead>Birim Fiyat</TableHead>
              <TableHead>İndirim %</TableHead>
              <TableHead>Vergi %</TableHead>
              <TableHead className="text-right">Toplam</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  Henüz teklif kalemi eklenmemiş
                </TableCell>
              </TableRow>
            ) : (
              <>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        placeholder="Ürün/Hizmet adı"
                        className="max-w-[250px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseInt(e.target.value))
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(item.id, "unit_price", parseFloat(e.target.value))
                        }
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount_rate || 0}
                        onChange={(e) =>
                          updateItem(item.id, "discount_rate", parseFloat(e.target.value))
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax_rate}
                        onChange={(e) =>
                          updateItem(item.id, "tax_rate", parseFloat(e.target.value))
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(item.total_price, item.currency)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Sil</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="space-y-1 min-w-[200px]">
          <div className="flex justify-between text-sm">
            <span>Ara Toplam:</span>
            <span>{formatMoney(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Toplam:</span>
            <span>{formatMoney(calculateSubtotal())}</span>
          </div>
        </div>
      </div>

      <ProductDetailsDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        selectedProduct={null}
        onSelectProduct={handleProductSelect}
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default ProposalItems;
