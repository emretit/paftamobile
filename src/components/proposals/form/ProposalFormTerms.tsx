
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProposalTermsProps {
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface Term {
  id: string;
  label: string;
  text: string;
}

// Predefined terms based on the image
const INITIAL_TERMS = {
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
  // State to hold all available terms (predefined + custom from DB)
  const [availableTerms, setAvailableTerms] = useState<{[key: string]: Term[]}>({
    payment: INITIAL_TERMS.payment,
    delivery: INITIAL_TERMS.delivery,
    warranty: INITIAL_TERMS.warranty,
    price: INITIAL_TERMS.price
  });

  const [customTermInputs, setCustomTermInputs] = useState<{[key: string]: { show: boolean, label: string, text: string }}>({
    payment: { show: false, label: '', text: '' },
    delivery: { show: false, label: '', text: '' },
    warranty: { show: false, label: '', text: '' },
    price: { show: false, label: '', text: '' }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load custom terms from database on component mount
  useEffect(() => {
    loadCustomTerms();
  }, []);

  const loadCustomTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('proposal_terms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data) {
        // Group custom terms by category and add to existing terms
        const customTermsByCategory = data.reduce((acc, term) => {
          if (!acc[term.category]) {
            acc[term.category] = [];
          }
          acc[term.category].push({
            id: term.id,
            label: term.label,
            text: term.text
          });
          return acc;
        }, {} as {[key: string]: Term[]});

        // Merge with initial terms
        setAvailableTerms(prev => ({
          payment: [...INITIAL_TERMS.payment, ...(customTermsByCategory.payment || [])],
          delivery: [...INITIAL_TERMS.delivery, ...(customTermsByCategory.delivery || [])],
          warranty: [...INITIAL_TERMS.warranty, ...(customTermsByCategory.warranty || [])],
          price: [...INITIAL_TERMS.price, ...(customTermsByCategory.price || [])]
        }));
      }
    } catch (error) {
      console.error('Error loading custom terms:', error);
    }
  };

  const handleTermSelect = (category: 'payment' | 'delivery' | 'warranty' | 'price', termId: string) => {
    // Find the selected term text
    const selectedTerm = availableTerms[category].find(t => t.id === termId);
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

  const handleAddCustomTerm = async (category: 'payment' | 'delivery' | 'warranty' | 'price') => {
    const customLabel = customTermInputs[category].label.trim();
    const customText = customTermInputs[category].text.trim();
    
    if (!customLabel || !customText) {
      toast.error("Lütfen hem başlık hem de açıklama giriniz.");
      return;
    }

    setIsLoading(true);

    try {
      // Save to database
      const { data, error } = await supabase
        .from('proposal_terms')
        .insert({
          category: category,
          label: customLabel,
          text: customText,
          is_default: false,
          is_active: true,
          sort_order: 999 // Put custom terms at the end
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new term to available terms
      const newTerm: Term = {
        id: data.id,
        label: customLabel,
        text: customText
      };

      setAvailableTerms(prev => ({
        ...prev,
        [category]: [...prev[category], newTerm]
      }));

      // Reset the custom input
      setCustomTermInputs(prev => ({
        ...prev,
        [category]: { show: false, label: '', text: '' }
      }));

      toast.success("Yeni şart başarıyla eklendi! Şimdi dropdown'dan seçebilirsiniz.");

    } catch (error) {
      console.error('Error saving custom term:', error);
      toast.error("Şart eklenirken bir hata oluştu: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDropdown = (category: 'payment' | 'delivery' | 'warranty' | 'price', title: string, placeholder: string) => (
    <div className="space-y-2">
      <Label>{title}</Label>
      
      {/* Dropdown for predefined terms */}
      <Select onValueChange={(value) => {
        if (value === 'add_custom') {
          setCustomTermInputs(prev => ({ 
            ...prev, 
            [category]: { ...prev[category], show: true } 
          }));
        } else {
          handleTermSelect(category, value);
        }
      }}>
        <SelectTrigger className="w-full bg-background border-border hover:border-primary transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border shadow-xl z-[100] max-h-[300px] overflow-y-auto">
          {availableTerms[category].map((term) => (
            <SelectItem 
              key={term.id} 
              value={term.id} 
              className="cursor-pointer hover:bg-accent focus:bg-accent data-[highlighted]:bg-accent p-3 transition-colors"
            >
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium text-sm text-foreground">{term.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed whitespace-normal max-w-[250px]">{term.text}</span>
              </div>
            </SelectItem>
          ))}
          
          {/* Add custom option */}
          <SelectItem value="add_custom" className="cursor-pointer hover:bg-accent focus:bg-accent data-[highlighted]:bg-accent p-3 border-t border-border mt-1">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Yeni şart ekle</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Custom term input card - rendered outside dropdown */}
      {customTermInputs[category].show && (
        <Card className="p-4 border-2 border-dashed border-primary/50 bg-primary/5">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Yeni {title} Şartı</h4>
            <div className="space-y-2">
              <Input
                placeholder="Şart başlığı giriniz..."
                value={customTermInputs[category].label}
                onChange={(e) => setCustomTermInputs(prev => ({ 
                  ...prev, 
                  [category]: { ...prev[category], label: e.target.value } 
                }))}
                className="text-sm"
                autoFocus
              />
              <Textarea
                placeholder="Şart açıklamasını yazınız..."
                value={customTermInputs[category].text}
                onChange={(e) => setCustomTermInputs(prev => ({ 
                  ...prev, 
                  [category]: { ...prev[category], text: e.target.value } 
                }))}
                className="text-sm min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleAddCustomTerm(category);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setCustomTermInputs(prev => ({ 
                      ...prev, 
                      [category]: { show: false, label: '', text: '' } 
                    }));
                  }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCustomTermInputs(prev => ({ 
                  ...prev, 
                  [category]: { show: false, label: '', text: '' } 
                }))}
                className="h-8 px-3 text-xs"
              >
                İptal
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleAddCustomTerm(category)}
                disabled={isLoading || !customTermInputs[category].label.trim() || !customTermInputs[category].text.trim()}
                className="h-8 px-3 text-xs"
              >
                <Plus size={14} className="mr-1" />
                {isLoading ? "Ekleniyor..." : "Dropdown'a Ekle"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl + Enter</kbd> ile hızlı ekle
            </p>
          </div>
        </Card>
      )}
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
