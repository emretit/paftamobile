import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState<string>("payment");
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

  const renderCategoryContent = (categoryKey: string) => {
    const categoryTerms = getTermsByCategory(categoryKey);
    
    return (
      <div className="space-y-3">
        {categoryTerms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Bu kategoride henüz şart bulunmuyor.</p>
            <p className="text-xs mt-1">Aşağıdaki formu kullanarak yeni şart ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {categoryTerms.map(term => (
              <div key={term.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                {editingTerm === term.id ? (
                  <div className="space-y-3">
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const labelEl = document.getElementById(`edit-label-${term.id}`) as HTMLInputElement;
                          const textEl = document.getElementById(`edit-text-${term.id}`) as HTMLTextAreaElement;
                          if (labelEl && textEl) {
                            updateTerm(term.id, { label: labelEl.value, text: textEl.value });
                          }
                        }}
                        className="flex-1"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Kaydet
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
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{term.label}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{term.text}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        {term.is_default && (
                          <Badge variant="secondary" className="text-xs">Varsayılan</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTerm(term.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        {!term.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTerm(term.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Şartlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header - Sabit */}
      <div className="text-center pb-2">
        <h3 className="text-lg font-semibold">Teklif Şartları Yönetimi</h3>
        <p className="text-sm text-muted-foreground">
          Tekliflerde kullanılacak şartları kategori bazında yönetin
        </p>
      </div>
      
      {/* Tab Sistemi */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.title}</span>
                <span className="sm:hidden">{category.title.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab İçerikleri */}
        {Object.entries(CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <category.icon className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{category.title}</h4>
              <Badge variant="outline" className="ml-auto">
                {getTermsByCategory(key).length} şart
              </Badge>
            </div>
            
            {/* Kategori İçeriği */}
            {renderCategoryContent(key)}
            
            {/* Hızlı Ekleme Formu */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni {category.title} Şartı Ekle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm">Şart Başlığı</Label>
                  <Input
                    value={newTerm.category === key ? newTerm.label : ""}
                    onChange={(e) => setNewTerm({ ...newTerm, label: e.target.value, category: key as any })}
                    placeholder="Ör: 60 Gün Vadeli"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Şart Metni</Label>
                  <Textarea
                    value={newTerm.category === key ? newTerm.text : ""}
                    onChange={(e) => setNewTerm({ ...newTerm, text: e.target.value, category: key as any })}
                    placeholder="Ör: Fatura tarihinden itibaren 60 gün vadeli ödenecektir."
                    className="mt-1 min-h-[60px]"
                  />
                </div>
                <Button 
                  onClick={() => {
                    if (newTerm.category !== key) {
                      setNewTerm({ label: "", text: "", category: key as any });
                    } else {
                      addNewTerm();
                    }
                  }} 
                  className="w-full"
                  disabled={newTerm.category === key && (!newTerm.label.trim() || !newTerm.text.trim())}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Şart Ekle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};