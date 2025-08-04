import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProposalTerm {
  id: string;
  category: 'payment' | 'pricing' | 'warranty' | 'delivery';
  label: string;
  text: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
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

export const TermsEditor: React.FC<TermsEditorProps> = ({
  settings,
  onSettingsChange
}) => {
  const [terms, setTerms] = useState<ProposalTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState({ 
    label: "", 
    text: "", 
    category: "payment" as const
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('proposal_terms')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast.error('Şartlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addNewTerm = async () => {
    if (!newTerm.label.trim() || !newTerm.text.trim()) {
      toast.error('Şart başlığı ve metni zorunludur');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('proposal_terms')
        .insert({
          category: newTerm.category,
          label: newTerm.label,
          text: newTerm.text,
          is_default: false,
          is_active: true,
          sort_order: terms.filter(t => t.category === newTerm.category).length + 1
        })
        .select()
        .single();

      if (error) throw error;
      
      setTerms([...terms, data]);
      setNewTerm({ label: "", text: "", category: "payment" });
      toast.success('Şart başarıyla eklendi');
    } catch (error) {
      console.error('Error adding term:', error);
      toast.error('Şart eklenirken hata oluştu');
    }
  };

  const updateTerm = async (termId: string, updates: Partial<ProposalTerm>) => {
    try {
      const { error } = await supabase
        .from('proposal_terms')
        .update(updates)
        .eq('id', termId);

      if (error) throw error;
      
      setTerms(terms.map(t => t.id === termId ? { ...t, ...updates } : t));
      setEditingTerm(null);
      toast.success('Şart başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating term:', error);
      toast.error('Şart güncellenirken hata oluştu');
    }
  };

  const deleteTerm = async (termId: string) => {
    try {
      const { error } = await supabase
        .from('proposal_terms')
        .update({ is_active: false })
        .eq('id', termId);

      if (error) throw error;
      
      setTerms(terms.filter(t => t.id !== termId));
      toast.success('Şart başarıyla silindi');
    } catch (error) {
      console.error('Error deleting term:', error);
      toast.error('Şart silinirken hata oluştu');
    }
  };

  const getTermsByCategory = (category: string) => {
    return terms.filter(t => t.category === category);
  };

  const renderCategory = (categoryKey: string, category: any) => {
    const Icon = category.icon;
    const categoryTerms = getTermsByCategory(categoryKey);
    
    return (
      <Card key={categoryKey}>
        <CardHeader className={`pb-3 bg-${category.color}-50`}>
          <CardTitle className={`flex items-center gap-2 text-${category.color}-600 text-base`}>
            <Icon className="h-5 w-5" />
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
                          updateTerm(term.id, { label: labelEl.value, text: textEl.value });
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
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{term.label}</h4>
                    <div className="flex gap-1">
                      {term.is_default && (
                        <Badge variant="secondary" className="text-xs">Varsayılan</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTerm(term.id)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      {!term.is_default && (
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
                  <p className="text-xs text-muted-foreground">{term.text}</p>
                </div>
              )}
            </div>
          ))}

          <Separator />

          {/* Add New Term to Category */}
          <div className="p-3 border-2 border-dashed rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Bu kategoriye yeni şart ekle</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewTerm({ ...newTerm, category: categoryKey as any })}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Yeni {category.title} Şartı
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Şartlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h3 className="text-lg font-semibold">Teklif Şartları Yönetimi</h3>
        <p className="text-sm text-gray-600 mt-1">
          Tekliflerde kullanılacak şartları tanımlayın ve yönetin
        </p>
      </div>
      
      <div className="space-y-4">
        {Object.entries(CATEGORIES).map(([key, category]) =>
          renderCategory(key, category)
        )}
      </div>

      <Separator />

      {/* Global Add New Term */}
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
              onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value as any })}
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