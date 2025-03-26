
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProposalTermsProps {
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProposalFormTerms: React.FC<ProposalTermsProps> = ({
  paymentTerms,
  deliveryTerms,
  notes,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-lg">Şartlar ve Koşullar</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
          <Textarea
            id="payment_terms"
            name="payment_terms"
            value={paymentTerms || ""}
            onChange={onInputChange}
            placeholder="Ödeme koşullarını belirtin"
            className="min-h-[80px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="delivery_terms">Teslimat Koşulları</Label>
          <Textarea
            id="delivery_terms"
            name="delivery_terms"
            value={deliveryTerms || ""}
            onChange={onInputChange}
            placeholder="Teslimat koşullarını belirtin"
            className="min-h-[80px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notlar</Label>
          <Textarea
            id="notes"
            name="notes"
            value={notes || ""}
            onChange={onInputChange}
            placeholder="Eklemek istediğiniz notlar"
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
    </div>
  );
};

export default ProposalFormTerms;
