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
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
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

  const addNewTerm = async (categoryKey?: string) => {
    const category = categoryKey || newTerm.category;
    if (!newTerm.label.trim() || !newTerm.text.trim()) {
      toast.error('Şart başlığı ve metni zorunludur');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('proposal_terms')
        .insert({
          category: category,
          label: newTerm.label,
          text: newTerm.text,
          is_default: false,
          is_active: true,
          sort_order: terms.filter(t => t.category === category).length + 1
        })
        .select()
        .single();

      if (error) throw error;
      
      setTerms([...terms, data]);
      setNewTerm({ label: "", text: "", category: "payment" });
      setAddingToCategory(null);
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
      <Card key={categoryKey} className="overflow-hidden border-none shadow-sm bg-card">
        <CardHeader className="pb-4 bg-gradient-to-r from-background/50 to-background/30 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-medium text-foreground">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {category.title}
              <Badge variant="secondary" className="ml-2 text-xs">
                {categoryTerms.length} şart
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddingToCategory(categoryKey)}
              className="text-primary hover:text-primary/80"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ekle
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {categoryTerms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Bu kategoride henüz şart bulunmuyor</p>
            </div>
          ) : (
            categoryTerms.map(term => (
              <div key={term.id} className="group">
                {editingTerm === term.id ? (
                  <Card className="p-4 border-primary/20 bg-primary/5">
                    <div className="space-y-3">
                      <Input
                        defaultValue={term.label}
                        placeholder="Şart başlığı"
                        className="font-medium"
                        id={`edit-label-${term.id}`}
                      />
                      <Textarea
                        defaultValue={term.text}
                        placeholder="Şart açıklaması"
                        className="min-h-[80px] resize-none"
                        id={`edit-text-${term.id}`}
                      />
                      <div className="flex gap-2 justify-end">
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
                          <Check className="h-4 w-4 mr-1" />
                          Kaydet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTerm(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          İptal
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20 group-hover:bg-accent/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{term.label}</h4>
                        {term.is_default && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Varsayılan
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTerm(term.id)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        {!term.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTerm(term.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{term.text}</p>
                  </Card>
                )}
              </div>
            ))
          )}

          {/* Quick Add Form for Category */}
          {addingToCategory === categoryKey && (
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Şart Başlığı</Label>
                  <Input
                    value={newTerm.label}
                    onChange={(e) => setNewTerm({ ...newTerm, label: e.target.value })}
                    placeholder="Ör: 60 Gün Vadeli"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Şart Açıklaması</Label>
                  <Textarea
                    value={newTerm.text}
                    onChange={(e) => setNewTerm({ ...newTerm, text: e.target.value })}
                    placeholder="Ör: Fatura tarihinden itibaren 60 gün vadeli ödenecektir."
                    className="mt-1 min-h-[80px] resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    onClick={() => addNewTerm(categoryKey)}
                    disabled={!newTerm.label.trim() || !newTerm.text.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAddingToCategory(null);
                      setNewTerm({ label: "", text: "", category: "payment" });
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    İptal
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Şartlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Teklif Şartları Yönetimi</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tekliflerinizde kullanacağınız özel şartları kategorilere göre düzenleyin ve yönetin. 
          Bu şartlar teklif hazırlarken seçilebilecek.
        </p>
      </div>
      
      {/* Categories */}
      <div className="space-y-6">
        {Object.entries(CATEGORIES).map(([key, category]) =>
          renderCategory(key, category)
        )}
      </div>

      {/* Global Add New Term - Only show if no category is being added to */}
      {!addingToCategory && (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
              <Plus className="h-5 w-5" />
              Genel Şart Ekle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Kategori Seçin</Label>
              <select
                value={newTerm.category}
                onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background"
              >
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.title}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Şart Başlığı</Label>
              <Input
                value={newTerm.label}
                onChange={(e) => setNewTerm({ ...newTerm, label: e.target.value })}
                placeholder="Ör: 60 Gün Vadeli"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Şart Açıklaması</Label>
              <Textarea
                value={newTerm.text}
                onChange={(e) => setNewTerm({ ...newTerm, text: e.target.value })}
                placeholder="Ör: Fatura tarihinden itibaren 60 gün vadeli ödenecektir."
                className="mt-1 min-h-[80px] resize-none"
              />
            </div>
            <Button 
              onClick={() => addNewTerm()} 
              className="w-full"
              disabled={!newTerm.label.trim() || !newTerm.text.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Şart Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};