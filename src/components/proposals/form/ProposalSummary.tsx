
import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface TotalValues {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discounts: number;
  additionalCharges: number;
}

interface ProposalSummaryProps {
  totalValues: TotalValues;
}

const ProposalSummary = ({ totalValues }: ProposalSummaryProps) => {
  const { register, watch, setValue } = useFormContext();
  
  const discounts = watch("discounts") || 0;
  const additionalCharges = watch("additionalCharges") || 0;
  
  const handleDiscountsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setValue("discounts", value);
  };
  
  const handleAdditionalChargesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setValue("additionalCharges", value);
  };
  
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Teklif Özeti</Label>
      
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Ara Toplam:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalValues.subtotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">KDV Tutarı:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalValues.taxAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">İndirim:</span>
            <div>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="w-32 h-8 text-right"
                value={discounts}
                onChange={handleDiscountsChange}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">Ek Ücretler:</span>
            <div>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="w-32 h-8 text-right"
                value={additionalCharges}
                onChange={handleAdditionalChargesChange}
              />
            </div>
          </div>
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Genel Toplam:</span>
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalValues.totalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalSummary;
