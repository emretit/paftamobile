
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
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "../ProductFormSchema";

interface CurrencySelectProps {
  form: UseFormReturn<ProductFormSchema>;
}

const CurrencySelect = ({ form }: CurrencySelectProps) => {
  return (
    <FormField
      control={form.control}
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Para Birimi</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
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
  );
};

export default CurrencySelect;
