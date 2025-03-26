
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

interface CurrencyDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  currencyOptions: CurrencyOption[];
  label?: string;
  className?: string;
  triggerClassName?: string;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  value,
  onValueChange,
  currencyOptions,
  label,
  className = "",
  triggerClassName = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="currency-select" className="font-medium">{label}</Label>
      )}
      <Select 
        value={value} 
        onValueChange={onValueChange}
      >
        <SelectTrigger id="currency-select" className={`w-full ${triggerClassName}`}>
          <SelectValue placeholder="Para Birimi" />
        </SelectTrigger>
        <SelectContent position="popper" className="bg-white z-[100] min-w-[8rem]">
          {currencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.symbol} {option.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencyDropdown;
