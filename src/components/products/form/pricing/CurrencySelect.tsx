
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

  return (
    <div className="space-y-1">
      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Para Birimi</FormLabel>
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
                <SelectItem value="TRY">Türk Lirası (TRY)</SelectItem>
                <SelectItem value="USD">Amerikan Doları (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">İngiliz Sterlini (GBP)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedCurrency && selectedCurrency !== "TRY" && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
          {formatExchangeRate(selectedCurrency, "TRY", getCurrentExchangeRates()[selectedCurrency])}
        </Badge>
      )}
    </div>
  );
};

export default CurrencySelect;
