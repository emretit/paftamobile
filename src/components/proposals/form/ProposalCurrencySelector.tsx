
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrencyOptions } from "../form/items/utils/currencyUtils";

interface ProposalCurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const ProposalCurrencySelector: React.FC<ProposalCurrencySelectorProps> = ({ 
  selectedCurrency, 
  onCurrencyChange 
}) => {
  const currencyOptions = getCurrencyOptions();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="currency-select" className="text-base font-medium">
              Teklif Para Birimi:
            </Label>
          </div>
          
          <Select 
            value={selectedCurrency} 
            onValueChange={onCurrencyChange}
          >
            <SelectTrigger id="currency-select" className="w-[130px]">
              <SelectValue placeholder="Para Birimi" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Alert variant="default" className="bg-muted/50 border-muted-foreground/20 ml-auto hidden sm:flex max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seçilen para birimi, tüm teklif kalemlerinin dönüştürüleceği ana para birimidir.
            </AlertDescription>
          </Alert>
        </div>
        
        <Alert variant="default" className="bg-muted/50 border-muted-foreground/20 mt-4 sm:hidden">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seçilen para birimi, tüm teklif kalemlerinin dönüştürüleceği ana para birimidir.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ProposalCurrencySelector;
