
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ProductFormSchema } from "../ProductFormSchema";

interface PriceInputProps {
  form: UseFormReturn<ProductFormSchema>;
  name: "price" | "discount_price" | "purchase_price";
  label: string;
  description?: string;
  isRequired?: boolean;
  showVatToggle?: boolean;
}

const PriceInput = ({ form, name, label, description, isRequired = false, showVatToggle = false }: PriceInputProps) => {
  const getVatToggleFieldName = () => {
    if (name === 'price') return 'price_includes_vat';
    if (name === 'purchase_price') return 'purchase_price_includes_vat';
    return null;
  };

  const vatToggleFieldName = getVatToggleFieldName();

  return (
    <div className="space-y-3">
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
      
      {showVatToggle && vatToggleFieldName && (
        <FormField
          control={form.control}
          name={vatToggleFieldName as keyof ProductFormSchema}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">
                  KDV Dahil Mi?
                </FormLabel>
                <FormDescription className="text-xs">
                  Bu fiyat KDV dahil mi hariç mi?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default PriceInput;
