
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ProposalItem } from "@/types/proposal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProposalItemsTableProps {
  items: ProposalItem[];
  handleItemChange: (index: number, field: keyof ProposalItem | 'currency', value: string | number) => void;
  handleRemoveItem: (index: number) => void;
  selectedCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
  currencyOptions: { value: string; label: string }[];
  taxRateOptions: { value: number; label: string }[];
}

const ProposalItemsTable = ({
  items,
  handleItemChange,
  handleRemoveItem,
  selectedCurrency,
  formatCurrency,
  currencyOptions,
  taxRateOptions,
}: ProposalItemsTableProps) => {
  return (
    <div className="min-w-full overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="py-3 px-4 text-left font-medium">Ürün/Hizmet</th>
            <th className="py-3 px-4 text-right font-medium w-20">Miktar</th>
            <th className="py-3 px-4 text-right font-medium w-32">Birim Fiyat</th>
            <th className="py-3 px-4 text-right font-medium w-20">Para Birimi</th>
            <th className="py-3 px-4 text-right font-medium w-20">KDV %</th>
            <th className="py-3 px-4 text-right font-medium w-32">Toplam</th>
            <th className="py-3 px-4 text-center font-medium w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-3 px-4 text-center text-muted-foreground">
                Henüz ürün eklenmedi. Ürün eklemek için yukarıdaki butonları kullanın.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-muted/20">
                <td className="py-3 px-4">
                  <Input
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    placeholder="Ürün/Hizmet adı"
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
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
                    onValueChange={(value) => handleItemChange(index, "currency", value)}
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

export default ProposalItemsTable;
