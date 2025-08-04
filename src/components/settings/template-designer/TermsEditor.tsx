import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  CreditCard,
  DollarSign,
  Shield,
  Truck
} from "lucide-react";

interface TermOption {
  id: string;
  label: string;
  text: string;
  category: string;
}

interface TermsEditorProps {
  settings: Record<string, any>;
  onSettingsChange: (newSettings: Record<string, any>) => void;
}

const CATEGORIES = {
  payment: { title: "Ödeme Şartları", icon: CreditCard, color: "blue" },
  pricing: { title: "Fiyat Bilgileri", icon: DollarSign, color: "green" },
  warranty: { title: "Garanti", icon: Shield, color: "purple" },
  delivery: { title: "Teslimat", icon: Truck, color: "orange" }
};

const DEFAULT_TERMS: TermOption[] = [
  { id: "payment_prepaid", label: "Peşin Ödeme", text: "%100 peşin ödeme yapılacaktır.", category: "payment" },
  { id: "payment_30_70", label: "30-70 Avans", text: "%30 avans, %70 işin tamamlanmasının ardından ödenecektir.", category: "payment" },
  { id: "pricing_vat_excluded", label: "KDV Hariç", text: "Belirtilen fiyatlar KDV hariçtir.", category: "pricing" },
  { id: "pricing_currency_tl", label: "TL Cinsinden", text: "Tüm fiyatlar Türk Lirası (TL) cinsindendir.", category: "pricing" },
  { id: "warranty_1year", label: "1 Yıl Garanti", text: "Ürünlerimiz fatura tarihinden itibaren 1 yıl garantilidir.", category: "warranty" },
  { id: "delivery_standard", label: "Standart Teslimat", text: "Ürünler siparişten sonra 15 gün içinde teslim edilecektir.", category: "delivery" }
];

export const TermsEditor: React.FC<TermsEditorProps> = ({
  settings,
  onSettingsChange
}) => {
  const [terms, setTerms] = useState<TermOption[]>(
    settings.availableTerms || DEFAULT_TERMS
  );
  const [selectedTerms, setSelectedTerms] = useState<string[]>(
    settings.selectedTerms || []
  );
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState({ 
    label: "", 
    text: "", 
    category: "payment" 
  });

  const updateSettings = (newTerms: TermOption[], newSelectedTerms: string[]) => {
    setTerms(newTerms);
    setSelectedTerms(newSelectedTerms);
    onSettingsChange({
      ...settings,
      availableTerms: newTerms,
      selectedTerms: newSelectedTerms
    });
  };

  const addNewTerm = () => {
    if (!newTerm.label.trim() || !newTerm.text.trim()) return;
    
    const termOption: TermOption = {
      id: `custom_${Date.now()}`,
      label: newTerm.label,
      text: newTerm.text,
      category: newTerm.category
    };
    
    const updatedTerms = [...terms, termOption];
    updateSettings(updatedTerms, selectedTerms);
    setNewTerm({ label: "", text: "", category: "payment" });
  };

  const deleteTerm = (termId: string) => {
    const updatedTerms = terms.filter(t => t.id !== termId);
    const updatedSelected = selectedTerms.filter(id => id !== termId);
    updateSettings(updatedTerms, updatedSelected);
  };

  const toggleTermSelection = (termId: string, checked: boolean) => {
    const updatedSelected = checked 
      ? [...selectedTerms, termId]
      : selectedTerms.filter(id => id !== termId);
    updateSettings(terms, updatedSelected);
  };

  const editTerm = (termId: string, newLabel: string, newText: string) => {
    const updatedTerms = terms.map(t => 
      t.id === termId 
        ? { ...t, label: newLabel, text: newText }
        : t
    );
    updateSettings(updatedTerms, selectedTerms);
    setEditingTerm(null);
  };

  const getTermsByCategory = (category: string) => {
    return terms.filter(t => t.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Selected Terms Summary */}
      <div className="p-3 bg-muted/30 rounded-lg">
        <Label className="text-sm font-medium">Seçili Şartlar ({selectedTerms.length})</Label>
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTerms.map(termId => {
            const term = terms.find(t => t.id === termId);
            if (!term) return null;
            const category = CATEGORIES[term.category as keyof typeof CATEGORIES];
            return (
              <Badge 
                key={termId} 
                variant="secondary" 
                className={`text-xs text-${category.color}-700 bg-${category.color}-50`}
              >
                {term.label}
              </Badge>
            );
          })}
          {selectedTerms.length === 0 && (
            <span className="text-xs text-muted-foreground">Henüz şart seçilmedi</span>
          )}
        </div>
      </div>

      {/* Terms by Category */}
      <div className="space-y-4">
        {Object.entries(CATEGORIES).map(([categoryKey, category]) => {
          const categoryTerms = getTermsByCategory(categoryKey);
          const Icon = category.icon;
          
          return (
            <Card key={categoryKey}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-sm text-${category.color}-600`}>
                  <Icon className="h-4 w-4" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryTerms.map(term => (
                  <div key={term.id} className="space-y-2">
                    {editingTerm === term.id ? (
                      <div className="space-y-2 p-2 border rounded">
                        <Input
                          defaultValue={term.label}
                          placeholder="Şart başlığı"
                          className="text-sm"
                          id={`edit-label-${term.id}`}
                        />
                        <Textarea
                          defaultValue={term.text}
                          placeholder="Şart metni"
                          className="text-sm min-h-[60px]"
                          id={`edit-text-${term.id}`}
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              const labelEl = document.getElementById(`edit-label-${term.id}`) as HTMLInputElement;
                              const textEl = document.getElementById(`edit-text-${term.id}`) as HTMLTextAreaElement;
                              if (labelEl && textEl) {
                                editTerm(term.id, labelEl.value, textEl.value);
                              }
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTerm(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedTerms.includes(term.id)}
                          onCheckedChange={(checked) => toggleTermSelection(term.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium cursor-pointer">
                              {term.label}
                            </Label>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingTerm(term.id)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              {term.id.startsWith('custom_') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteTerm(term.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{term.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Add New Term */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Yeni Şart Ekle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Kategori</Label>
            <select
              value={newTerm.category}
              onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
            >
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.title}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm">Şart Başlığı</Label>
            <Input
              value={newTerm.label}
              onChange={(e) => setNewTerm({ ...newTerm, label: e.target.value })}
              placeholder="Ör: 60 Gün Vadeli"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Şart Metni</Label>
            <Textarea
              value={newTerm.text}
              onChange={(e) => setNewTerm({ ...newTerm, text: e.target.value })}
              placeholder="Ör: Fatura tarihinden itibaren 60 gün vadeli ödenecektir."
              className="mt-1 min-h-[80px]"
            />
          </div>
          <Button onClick={addNewTerm} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Şart Ekle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};