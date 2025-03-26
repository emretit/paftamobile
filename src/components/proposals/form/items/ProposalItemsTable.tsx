
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Tag } from "lucide-react";
import { ProposalItem } from "@/types/proposal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PROPOSAL_ITEM_GROUPS } from "./proposalItemsConstants";

interface ProposalItemsTableProps {
  items: ProposalItem[];
  handleItemChange: (index: number, field: keyof ProposalItem | 'currency' | 'discount_rate', value: string | number) => void;
  handleRemoveItem: (index: number) => void;
  handleItemCurrencyChange?: (index: number, currency: string) => void;
  selectedCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
  currencyOptions: { value: string; label: string }[];
  taxRateOptions: { value: number; label: string }[];
}

const ProposalItemsTable = ({
  items,
  handleItemChange,
  handleRemoveItem,
  handleItemCurrencyChange,
  selectedCurrency,
  formatCurrency,
  currencyOptions,
  taxRateOptions,
}: ProposalItemsTableProps) => {
  // Para birimi değişikliğini ele alma
  const onCurrencyChange = (index: number, value: string) => {
    if (handleItemCurrencyChange) {
      // Özel para birimi değişikliği işleyicisini kullan
      handleItemCurrencyChange(index, value);
    } else {
      // Standart item değişikliği işleyicisini kullan
      handleItemChange(index, "currency", value);
    }
  };

  return (
    <div className="min-w-full overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="py-3 px-4 text-left font-medium">Ürün/Hizmet</th>
            <th className="py-3 px-4 text-left font-medium w-28">Grup</th>
            <th className="py-3 px-4 text-right font-medium w-20">Miktar</th>
            <th className="py-3 px-4 text-right font-medium w-32">Birim Fiyat</th>
            <th className="py-3 px-4 text-center font-medium w-20">Para Birimi</th>
            <th className="py-3 px-4 text-center font-medium w-20">KDV %</th>
            <th className="py-3 px-4 text-center font-medium w-20">İndirim %</th>
            <th className="py-3 px-4 text-right font-medium w-32">Toplam</th>
            <th className="py-3 px-4 text-center font-medium w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-3 px-4 text-center text-muted-foreground">
                Henüz ürün eklenmedi. Ürün eklemek için yukarıdaki butonları kullanın.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-muted/20">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      placeholder="Ürün/Hizmet adı"
                      className="border-0 bg-transparent focus-visible:ring-0"
                    />
                    {(item as any).stock_status && (
                      <div className="mt-1">
                        <StockStatusIndicator status={(item as any).stock_status} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Select 
                    value={item.group || ""}
                    onValueChange={(value) => handleItemChange(index, "group", value)}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus-visible:ring-0 h-8 w-full">
                      <SelectValue placeholder="Grup Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPOSAL_ITEM_GROUPS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-4">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0"
                  />
                </td>
                <td className="py-3 px-4">
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0"
                  />
                </td>
                <td className="py-3 px-4">
                  <Select 
                    value={(item as any).currency || selectedCurrency} 
                    onValueChange={(value) => onCurrencyChange(index, value)}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus-visible:ring-0 h-8 w-full">
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
                </td>
                <td className="py-3 px-4">
                  <Select 
                    value={String(item.tax_rate)} 
                    onValueChange={(value) => handleItemChange(index, "tax_rate", parseInt(value))}
                  >
                    <SelectTrigger className="border-0 bg-transparent focus-visible:ring-0 h-8 w-full">
                      <SelectValue placeholder="KDV" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxRateOptions.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-4">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={(item as any).discount_rate || 0}
                    onChange={(e) => handleItemChange(index, "discount_rate", Math.min(100, parseInt(e.target.value) || 0))}
                    className="text-right border-0 bg-transparent focus-visible:ring-0"
                  />
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatCurrency(item.total_price, (item as any).currency || selectedCurrency)}
                </td>
                <td className="py-3 px-4 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const StockStatusIndicator = ({ status }: { status: string }) => {
  let statusText = "";
  let statusColor = "";

  switch (status) {
    case "in_stock":
      statusText = "Stokta";
      statusColor = "text-green-500";
      break;
    case "low_stock":
      statusText = "Düşük Stok";
      statusColor = "text-yellow-500";
      break;
    case "out_of_stock":
      statusText = "Stokta Yok";
      statusColor = "text-red-500";
      break;
    default:
      return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`text-xs inline-flex items-center ${statusColor}`}>
            <Tag className="h-3 w-3 mr-1" /> {statusText}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusText === "Stokta Yok" ? "Bu ürün stokta bulunmuyor" : 
             statusText === "Düşük Stok" ? "Bu ürünün stok seviyesi düşük" : 
             "Bu ürün stokta mevcut"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProposalItemsTable;
