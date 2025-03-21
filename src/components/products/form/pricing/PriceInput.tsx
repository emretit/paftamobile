
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "../ProductFormSchema";

interface PriceInputProps {
  form: UseFormReturn<ProductFormSchema>;
  name: "price" | "discount_price";
  label: string;
  description?: string;
  isRequired?: boolean;
}

const PriceInput = ({ form, name, label, description, isRequired = false }: PriceInputProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{isRequired && " *"}</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min="0" 
              step="0.01"
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                if (name === 'price') {
                  field.onChange(parseFloat(e.target.value) || 0);
                } else {
                  field.onChange(e.target.value ? parseFloat(e.target.value) : null);
                }
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PriceInput;
