
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ProductFormSchema } from "../ProductFormSchema";
import { Badge } from "@/components/ui/badge";
import { 
  getCurrentExchangeRates, 
  formatExchangeRate 
} from "@/components/proposals/form/items/utils/currencyUtils";
import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface CurrencySelectProps {
  form: UseFormReturn<ProductFormSchema>;
}

const CurrencySelect = ({ form }: CurrencySelectProps) => {
  const selectedCurrency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: "TRY"
  });

  // Update exchange rate when currency changes
  useEffect(() => {
    if (selectedCurrency && selectedCurrency !== "TRY") {
      const rates = getCurrentExchangeRates();
      form.setValue("exchange_rate", rates[selectedCurrency] || 1);
    } else {
      form.setValue("exchange_rate", undefined);
    }
  }, [selectedCurrency, form]);

  const currencyOptions = [
    { value: "TRY", label: "Türk Lirası (TRY)" },
    { value: "USD", label: "Amerikan Doları (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "İngiliz Sterlini (GBP)" }
  ];

  return (
    <div className="space-y-1">
      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Para Birimi</FormLabel>
              {field.value && field.value !== "TRY" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Farklı para birimi seçildiğinde, döviz kuru otomatik olarak uygulanır</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select
              onValueChange={field.onChange}
              value={field.value || "TRY"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçiniz" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {currencyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedCurrency && selectedCurrency !== "TRY" && (
        <div className="flex items-center mt-1 text-sm">
          <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
            {formatExchangeRate(selectedCurrency, "TRY", getCurrentExchangeRates()[selectedCurrency])}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;
