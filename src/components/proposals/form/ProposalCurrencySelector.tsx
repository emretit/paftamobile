
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrencyOptions } from "./items/utils/currencyUtils";
import { ProposalFormData } from "@/types/proposal-form";

interface ProposalCurrencySelectorProps {
  form: UseFormReturn<ProposalFormData>;
  onCurrencyChange?: (value: string) => void;
}

// For direct usage without react-hook-form
interface DirectProposalCurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
}

export const ProposalCurrencySelector = ({ 
  form, 
  onCurrencyChange 
}: ProposalCurrencySelectorProps) => {
  const handleValueChange = (value: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(value);
    }
  };

  return (
    <FormField
      control={form.control}
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Para Birimi</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                handleValueChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Para birimi seçin" />
              </SelectTrigger>
              <SelectContent>
                {getCurrencyOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

// Direct selector component without react-hook-form
export const DirectCurrencySelector = ({
  selectedCurrency,
  onCurrencyChange
}: DirectProposalCurrencySelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Para Birimi</label>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Para birimi seçin" />
        </SelectTrigger>
        <SelectContent>
          {getCurrencyOptions().map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProposalCurrencySelector;
