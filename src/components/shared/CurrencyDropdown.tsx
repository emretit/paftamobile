
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";
import { CurrencyOption } from "@/components/proposals/form/items/types/currencyTypes";

interface CurrencyDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  currencyOptions: CurrencyOption[];
  label?: string;
  isLoading?: boolean;
  className?: string;
  triggerClassName?: string;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  value,
  onValueChange,
  currencyOptions,
  label,
  isLoading = false,
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
        disabled={isLoading}
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
      {isLoading && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <RefreshCcw className="h-3 w-3 animate-spin" />
          <span>Kurlar yükleniyor...</span>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
