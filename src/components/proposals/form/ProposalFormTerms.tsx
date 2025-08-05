
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, Plus } from "lucide-react";

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
  const [customTermInputs, setCustomTermInputs] = useState<{[key: string]: { show: boolean, value: string }}>({
    payment: { show: false, value: '' },
    delivery: { show: false, value: '' },
    warranty: { show: false, value: '' },
    price: { show: false, value: '' }
  });
  const handleTermSelect = (category: 'payment' | 'delivery' | 'warranty' | 'price', termId: string) => {
    // Find the selected term text
    const selectedTerm = PREDEFINED_TERMS[category].find(t => t.id === termId);
    if (!selectedTerm) return;

    // Get the current field value based on category
    let currentValue = '';
    let fieldName = '';
    
    if (category === 'payment') {
      currentValue = paymentTerms || '';
      fieldName = 'payment_terms';
    } else if (category === 'delivery') {
      currentValue = deliveryTerms || '';
      fieldName = 'delivery_terms';
    } else {
      // For warranty and price, we'll add to notes
      currentValue = notes || '';
      fieldName = 'notes';
    }

    const newValue = currentValue ? `${currentValue}\n\n${selectedTerm.text}` : selectedTerm.text;

    // Create a synthetic event to update the appropriate field
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: newValue
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onInputChange(syntheticEvent);
  };

  const handleAddCustomTerm = (category: 'payment' | 'delivery' | 'warranty' | 'price') => {
    const customText = customTermInputs[category].value.trim();
    if (!customText) return;

    // Get the current field value based on category
    let currentValue = '';
    let fieldName = '';
    
    if (category === 'payment') {
      currentValue = paymentTerms || '';
      fieldName = 'payment_terms';
    } else if (category === 'delivery') {
      currentValue = deliveryTerms || '';
      fieldName = 'delivery_terms';
    } else {
      // For warranty and price, we'll add to notes
      currentValue = notes || '';
      fieldName = 'notes';
    }

    const newValue = currentValue ? `${currentValue}\n\n${customText}` : customText;

    // Create a synthetic event to update the appropriate field
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: newValue
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onInputChange(syntheticEvent);

    // Reset the custom input
    setCustomTermInputs(prev => ({
      ...prev,
      [category]: { show: false, value: '' }
    }));
  };

  const renderDropdown = (category: 'payment' | 'delivery' | 'warranty' | 'price', title: string, placeholder: string) => (
    <div className="space-y-2">
      <Label>{title}</Label>
      <Select onValueChange={(value) => handleTermSelect(category, value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50 max-h-[200px] overflow-y-auto">
          {PREDEFINED_TERMS[category].map((term) => (
            <SelectItem 
              key={term.id} 
              value={term.id} 
              className="cursor-pointer hover:bg-accent/50 focus:bg-accent/50 data-[highlighted]:bg-accent/50 p-3 transition-colors"
            >
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium text-sm text-foreground">{term.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{term.text}</span>
              </div>
            </SelectItem>
          ))}
          
          {/* Custom term input section */}
          <div className="border-t border-border mt-2 pt-2">
            {!customTermInputs[category].show ? (
              <div 
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-accent/50 transition-colors rounded-sm"
                onClick={() => setCustomTermInputs(prev => ({ ...prev, [category]: { ...prev[category], show: true } }))}
              >
                <Plus size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Yeni şart ekle</span>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                <Input
                  placeholder="Yeni şart yazın..."
                  value={customTermInputs[category].value}
                  onChange={(e) => setCustomTermInputs(prev => ({ 
                    ...prev, 
                    [category]: { ...prev[category], value: e.target.value } 
                  }))}
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomTerm(category);
                    } else if (e.key === 'Escape') {
                      setCustomTermInputs(prev => ({ 
                        ...prev, 
                        [category]: { show: false, value: '' } 
                      }));
                    }
                  }}
                />
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    onClick={() => handleAddCustomTerm(category)}
                    className="h-7 px-2 text-xs"
                  >
                    Ekle
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCustomTermInputs(prev => ({ 
                      ...prev, 
                      [category]: { show: false, value: '' } 
                    }))}
                    className="h-7 px-2 text-xs"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-lg">Şartlar ve Koşullar</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-6">
        {/* Predefined Terms Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderDropdown('payment', 'Peşin Ödeme', 'Ödeme koşulu seçin')}
          {renderDropdown('delivery', 'Teslimat', 'Teslimat koşulu seçin')}
          {renderDropdown('warranty', 'Garanti', 'Garanti koşulu seçin')}
          {renderDropdown('price', 'Fiyat', 'Fiyat koşulu seçin')}
        </div>

        {/* Custom Terms Input */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
            <Textarea
              id="payment_terms"
              name="payment_terms"
              value={paymentTerms || ""}
              onChange={onInputChange}
              placeholder="Seçilen ödeme koşulları burada görünecek"
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
              placeholder="Seçilen teslimat koşulları burada görünecek"
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Other Terms Input */}
        <div className="space-y-2">
          <Label htmlFor="notes">Diğer Şartlar</Label>
          <Textarea
            id="notes"
            name="notes"
            value={notes || ""}
            onChange={onInputChange}
            placeholder="Ekstra şartlar ve notlar buraya yazılabilir"
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
    </div>
  );
};

export default ProposalFormTerms;
