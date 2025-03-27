
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProposalItem } from "@/types/proposal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface ProposalItemsTableProps {
  items: ProposalItem[];
  handleItemChange: (index: number, field: keyof ProposalItem, value: any) => void;
  handleRemoveItem: (index: number) => void;
  selectedCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
  currencyOptions: { value: string; label: string; symbol: string }[];
  taxRateOptions: { value: number; label: string }[];
  handleItemCurrencyChange: (index: number, currency: string) => void;
}

const ProposalItemsTable: React.FC<ProposalItemsTableProps> = ({
  items,
  handleItemChange,
  handleRemoveItem,
  selectedCurrency,
  formatCurrency,
  currencyOptions,
  taxRateOptions,
  handleItemCurrencyChange,
}) => {
  const { convertCurrency } = useExchangeRates();
  
  // Format number with 2 decimal places
  const formatNumber = (value: number) => {
    return Number(value).toFixed(2);
  };

  const getStockStatusColor = (status?: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-300";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStockStatusText = (status?: string) => {
    switch (status) {
      case "in_stock":
        return "Stokta";
      case "low_stock":
        return "Az Stok";
      case "out_of_stock":
        return "Stok Yok";
      default:
        return "Bilinmiyor";
    }
  };

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">Ürün/Hizmet</TableHead>
            <TableHead className="w-[100px]">Adet</TableHead>
            <TableHead className="w-[170px]">Para Birimi</TableHead>
            <TableHead className="w-[150px]">Birim Fiyat</TableHead>
            <TableHead className="w-[100px]">İndirim %</TableHead>
            <TableHead className="w-[100px]">KDV %</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                Henüz teklif kalemi eklenmemiş
              </TableCell>
            </TableRow>
          ) : (
            <>
              {items.map((item, index) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        placeholder="Ürün/Hizmet adı"
                        className="h-9"
                      />
                      {item.stock_status && (
                        <div className="flex items-center">
                          <Badge variant="outline" className={`text-xs py-0 px-2 ${getStockStatusColor(item.stock_status)}`}>
                            {getStockStatusText(item.stock_status)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3 px-4">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                      className="h-9 w-20"
                    />
                  </TableCell>
                  
                  <TableCell className="py-3 px-4">
                    <Select
                      value={item.currency || selectedCurrency}
                      onValueChange={(value) => {
                        // Call the currency change handler which will handle conversion
                        handleItemCurrencyChange(index, value);
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Para Birimi" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.symbol} {option.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {item.original_currency && item.original_currency !== (item.currency || selectedCurrency) && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          Orijinal: {item.original_currency}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-3 px-4">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formatNumber(item.unit_price)}
                      onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                      className="h-9 w-full"
                    />
                  </TableCell>
                  
                  <TableCell className="py-3 px-4">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount_rate || 0}
                      onChange={(e) => handleItemChange(index, "discount_rate", parseFloat(e.target.value) || 0)}
                      className="h-9 w-20"
                    />
                  </TableCell>
                  
                  <TableCell className="py-3 px-4">
                    <Select
                      value={String(item.tax_rate || 18)}
                      onValueChange={(value) => handleItemChange(index, "tax_rate", Number(value))}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="KDV Oranı" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxRateOptions.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell className="text-right font-medium py-3 px-4">
                    {formatCurrency(item.total_price, item.currency || selectedCurrency)}
                    {item.currency && item.currency !== selectedCurrency && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(
                          convertCurrency(item.total_price, item.currency, selectedCurrency),
                          selectedCurrency
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-3 px-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Teklif kalemini sil</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};

export default ProposalItemsTable;
