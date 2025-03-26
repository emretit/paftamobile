
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "../ProductFormSchema";

interface CurrencySelectProps {
  form: UseFormReturn<ProductFormSchema>;
}

const CurrencySelect = ({ form }: CurrencySelectProps) => {
  return (
    <div className="space-y-1">
      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Para Birimi</FormLabel>
            <FormControl>
              <div className="p-2 border rounded-md bg-gray-50 text-gray-700">
                TRY (Türk Lirası)
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CurrencySelect;
