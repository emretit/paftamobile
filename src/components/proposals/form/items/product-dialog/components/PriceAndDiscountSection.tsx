
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "../utils/currencyFormatUtils";

interface PriceAndDiscountSectionProps {
  customPrice: number | undefined;
  setCustomPrice: (value: number | undefined) => void;
  discountRate: number;
  setDiscountRate: (value: number) => void;
  selectedCurrency: string;
  handleCurrencyChange: (value: string) => void;
  convertedPrice: number;
  originalCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const PriceAndDiscountSection: React.FC<PriceAndDiscountSectionProps> = ({
  customPrice,
  setCustomPrice,
  discountRate,
  setDiscountRate,
  selectedCurrency,
  handleCurrencyChange,
  convertedPrice,
  originalCurrency,
  formatCurrency
}) => {
  const [open, setOpen] = useState(false);
  const [priceOptions, setPriceOptions] = useState<Array<{value: number, label: string}>>([]);
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [inputPrice, setInputPrice] = useState<string>("");

  // Initialize price options based on convertedPrice
  useEffect(() => {
    // Create price options: original price and some variations
    const basePrice = convertedPrice;
    const options = [
      { value: basePrice, label: formatPrice(basePrice) },
      { value: basePrice * 0.95, label: formatPrice(basePrice * 0.95) + " (-5%)" },
      { value: basePrice * 0.9, label: formatPrice(basePrice * 0.9) + " (-10%)" },
      { value: basePrice * 1.05, label: formatPrice(basePrice * 1.05) + " (+5%)" },
      { value: basePrice * 1.1, label: formatPrice(basePrice * 1.1) + " (+10%)" },
    ];
    setPriceOptions(options);
    
    // Set initial price
    if (customPrice === undefined) {
      setCustomPrice(basePrice);
    } else {
      // Check if custom price matches any of our options
      const matchingOption = options.find(option => Math.abs(option.value - customPrice) < 0.01);
      setIsCustomPrice(!matchingOption);
      if (!matchingOption) {
        setInputPrice(customPrice.toString());
      }
    }
  }, [convertedPrice, customPrice, setCustomPrice]);

  // Format price with currency symbol
  const formatPrice = (price: number): string => {
    const symbol = getCurrencySymbol(selectedCurrency);
    return `${symbol} ${price.toFixed(2)}`;
  }

  // Handle custom price input change
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputPrice(value);
    if (value && !isNaN(parseFloat(value))) {
      setCustomPrice(parseFloat(value));
    }
  };

  // Handle price selection from dropdown
  const handlePriceSelect = (value: string) => {
    if (value === "custom") {
      setIsCustomPrice(true);
    } else {
      const priceValue = parseFloat(value);
      setCustomPrice(priceValue);
      setIsCustomPrice(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price" className="flex items-center justify-between">
          <span>Birim Fiyat</span>
          <Select 
            value={selectedCurrency} 
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="h-7 w-24" id="currency-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRY">₺ TRY</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
              <SelectItem value="GBP">£ GBP</SelectItem>
            </SelectContent>
          </Select>
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {isCustomPrice 
                ? `Özel: ${formatPrice(parseFloat(inputPrice) || 0)}` 
                : (customPrice !== undefined 
                  ? formatPrice(customPrice)
                  : "Fiyat Seçin")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-popover">
            <div className="max-h-[200px] overflow-auto">
              {priceOptions.map((option) => (
                <div
                  key={option.value.toString()}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    customPrice === option.value && !isCustomPrice ? "bg-accent text-accent-foreground" : ""
                  )}
                  onClick={() => {
                    handlePriceSelect(option.value.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "absolute left-2 h-4 w-4",
                      customPrice === option.value && !isCustomPrice ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              ))}
              <div
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  isCustomPrice ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => {
                  setIsCustomPrice(true);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "absolute left-2 h-4 w-4",
                    isCustomPrice ? "opacity-100" : "opacity-0"
                  )}
                />
                Özel Fiyat
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {isCustomPrice && (
          <Input
            id="custom-price"
            type="number"
            min="0"
            step="0.01"
            value={inputPrice}
            onChange={handlePriceInputChange}
            placeholder="Özel fiyat giriniz"
            className="mt-2"
          />
        )}

        {originalCurrency !== selectedCurrency && (
          <p className="text-xs text-muted-foreground mt-1">
            Dönüştürülmüş: {formatCurrency(convertedPrice, selectedCurrency)}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="discount">İndirim Oranı (%)</Label>
        <Input
          id="discount"
          type="number"
          min="0"
          max="100"
          value={discountRate}
          onChange={(e) => setDiscountRate(Math.min(100, parseInt(e.target.value) || 0))}
        />
      </div>
    </div>
  );
};

export default PriceAndDiscountSection;
