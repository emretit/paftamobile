
import React, { useCallback, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProposalItem } from "@/types/proposal";

interface ProposalCurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  items: ProposalItem[];
  onItemsChange: (items: ProposalItem[]) => void;
}

const CURRENCY_OPTIONS = [
  { value: "TRY", label: "₺ Türk Lirası" },
  { value: "USD", label: "$ Amerikan Doları" },
  { value: "EUR", label: "€ Euro" },
  { value: "GBP", label: "£ İngiliz Sterlini" },
] as const;

const ProposalCurrencySelector: React.FC<ProposalCurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  items,
  onItemsChange
}) => {
  // Memoize currency options to prevent unnecessary re-renders
  const currencyOptions = useMemo(() => CURRENCY_OPTIONS, []);
  
  // Use useCallback to prevent function recreation on every render
  const handleCurrencyChange = useCallback((currency: string) => {
    console.log("Currency selector: changing from", selectedCurrency, "to", currency);
    
    // Only proceed if currency actually changed
    if (currency === selectedCurrency) {
      console.log("Currency selector: no change needed");
      return;
    }
    
    // Call the parent's currency change handler
    onCurrencyChange(currency);
  }, [selectedCurrency, onCurrencyChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="proposal-currency">Teklif Para Birimi</Label>
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger id="proposal-currency" className="w-[200px]">
          <SelectValue placeholder="Para birimi seçin" />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default React.memo(ProposalCurrencySelector);
