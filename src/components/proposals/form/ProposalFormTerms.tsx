
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ProposalTermsProps {
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// Predefined terms based on the image
const PREDEFINED_TERMS = {
  payment: [
    { id: "pesin", label: "Peşin Ödeme", text: "%100 peşin ödeme yapılacaktır." },
    { id: "vade30", label: "30-70 Avans - Vadeli", text: "%30 avans, kalan %70 teslimde ödenecektir." },
    { id: "vade50", label: "50-50 Avans - Vadeli", text: "%50 avans, kalan %50 teslimde ödenecektir." },
    { id: "vade30gun", label: "30 Gün Vadeli", text: "Fatura tarihinden itibaren 30 gün vadeli ödenecektir." }
  ],
  delivery: [
    { id: "hemen", label: "Teslimat", text: "Sipariş tarihinden itibaren 7-10 iş günü içinde teslimat yapılacaktır." },
    { id: "standart", label: "Standart Teslimat", text: "Sipariş tarihinden itibaren 15-20 iş günü içinde teslimat yapılacaktır." },
    { id: "hizli", label: "Hızlı Teslimat", text: "Sipariş tarihinden itibaren 3-5 iş günü içinde teslimat yapılacaktır." }
  ],
  warranty: [
    { id: "garanti1", label: "Garanti", text: "Ürünlerimiz 1 yıl garantilidir." },
    { id: "garanti2", label: "2 Yıl Garanti", text: "Ürünlerimiz 2 yıl garantilidir." },
    { id: "garanti3", label: "Uzatılmış Garanti", text: "Ürünlerimiz 3 yıl garantilidir." }
  ],
  price: [
    { id: "fiyat", label: "Fiyat", text: "Belirtilen fiyatlar KDV hariçtir." },
    { id: "fiyatdahil", label: "KDV Dahil Fiyat", text: "Belirtilen fiyatlar KDV dahildir." },
    { id: "fiyatgecerli", label: "Fiyat Geçerliliği", text: "Fiyatlar 30 gün geçerlidir." }
  ]
};

const ProposalFormTerms: React.FC<ProposalTermsProps> = ({
  paymentTerms,
  deliveryTerms,
  notes,
  onInputChange
}) => {
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string[]>([]);
  const [selectedDeliveryTerms, setSelectedDeliveryTerms] = useState<string[]>([]);
  const [selectedWarrantyTerms, setSelectedWarrantyTerms] = useState<string[]>([]);
  const [selectedPriceTerms, setSelectedPriceTerms] = useState<string[]>([]);

  const handleTermSelect = (category: 'payment' | 'delivery' | 'warranty' | 'price', termId: string, termText: string) => {
    const setters = {
      payment: setSelectedPaymentTerms,
      delivery: setSelectedDeliveryTerms,
      warranty: setSelectedWarrantyTerms,
      price: setSelectedPriceTerms
    };
    
    const getters = {
      payment: selectedPaymentTerms,
      delivery: selectedDeliveryTerms,
      warranty: selectedWarrantyTerms,
      price: selectedPriceTerms
    };

    const currentTerms = getters[category];
    const isSelected = currentTerms.includes(termId);
    
    let newTerms: string[];
    if (isSelected) {
      newTerms = currentTerms.filter(id => id !== termId);
    } else {
      newTerms = [...currentTerms, termId];
    }
    
    setters[category](newTerms);

    // Build the combined text for the appropriate field
    const selectedTexts = newTerms.map(id => {
      const term = PREDEFINED_TERMS[category].find(t => t.id === id);
      return term ? term.text : '';
    }).filter(Boolean);

    // Create a synthetic event to update the form
    const syntheticEvent = {
      target: {
        name: category === 'payment' ? 'payment_terms' : 'delivery_terms',
        value: selectedTexts.join('\n\n')
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onInputChange(syntheticEvent);
  };

  const renderTermCategory = (category: 'payment' | 'delivery' | 'warranty' | 'price', title: string, selectedTerms: string[]) => (
    <Card className="p-4">
      <h4 className="font-medium mb-3">{title}</h4>
      <div className="space-y-2">
        {PREDEFINED_TERMS[category].map((term) => {
          const isSelected = selectedTerms.includes(term.id);
          return (
            <Button
              key={term.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`w-full justify-start text-left h-auto p-3 ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => handleTermSelect(category, term.id, term.text)}
            >
              <div className="flex items-start gap-2 w-full">
                <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-medium">{term.label}</span>
                  <span className="text-xs opacity-80 font-normal">{term.text}</span>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-lg">Şartlar ve Koşullar</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-6">
        {/* Predefined Terms Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTermCategory('payment', 'Peşin Ödeme', selectedPaymentTerms)}
          {renderTermCategory('delivery', 'Teslimat', selectedDeliveryTerms)}
          {renderTermCategory('warranty', 'Garanti', selectedWarrantyTerms)}
          {renderTermCategory('price', 'Fiyat', selectedPriceTerms)}
        </div>

        {/* Custom Terms Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
            <Textarea
              id="payment_terms"
              name="payment_terms"
              value={paymentTerms || ""}
              onChange={onInputChange}
              placeholder="Seçilen koşullar burada görünecek veya özel koşullar ekleyebilirsiniz"
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
              placeholder="Seçilen koşullar burada görünecek veya özel koşullar ekleyebilirsiniz"
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
        </div>
      </CardContent>
    </div>
  );
};

export default ProposalFormTerms;
