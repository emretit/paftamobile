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
      <div className="space-y-2">
        {categoryTerms.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-xs">Bu kategoride henüz şart bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {categoryTerms.map(term => (
              <div key={term.id} className="group">
                {editingTerm === term.id ? (
                  <div className="border rounded p-2 space-y-2 bg-muted/50">
                    <Input
                      defaultValue={term.label}
                      placeholder="Şart başlığı"
                      className="text-xs h-7"
                      id={`edit-label-${term.id}`}
                    />
                    <Textarea
                      defaultValue={term.text}
                      placeholder="Şart metni"
                      className="text-xs min-h-[50px] resize-none"
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
                        className="h-6 text-xs flex-1"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Kaydet
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTerm(null)}
                        className="h-6 text-xs"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-xs truncate">{term.label}</h4>
                        {term.is_default && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Varsayılan</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{term.text}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTerm(term.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      {!term.is_default && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTerm(term.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
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
    <div className="space-y-2">
      <Tabs defaultValue="payment" className="w-full">
        {/* Horizontal scrollable tabs - sayfaya uyumlu */}
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-8 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full">
            {Object.entries(CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {category.title}
                </TabsTrigger>
              );
            })}
            <TabsTrigger 
              value="other" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Diğer Şartlar
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        {Object.entries(CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-2 mt-2">
            {renderCategoryContent(key)}
            
            {/* Minimal Ekleme Formu */}
            <div className="mt-2 p-2 border-2 border-dashed border-muted rounded space-y-1">
              <Input
                value={newTerm.category === key ? newTerm.label : ""}
                onChange={(e) => setNewTerm({ ...newTerm, label: e.target.value, category: key as any })}
                placeholder="Yeni şart başlığı..."
                className="text-xs h-6 border-0 shadow-none focus-visible:ring-1"
              />
              <Textarea
                value={newTerm.category === key ? newTerm.text : ""}
                onChange={(e) => setNewTerm({ ...newTerm, text: e.target.value, category: key as any })}
                placeholder="Şart açıklaması..."
                className="text-xs min-h-[35px] resize-none border-0 shadow-none focus-visible:ring-1"
              />
              <Button 
                onClick={() => {
                  if (newTerm.category !== key) {
                    setNewTerm({ label: "", text: "", category: key as any });
                  } else {
                    addNewTerm();
                  }
                }} 
                className="w-full h-6 text-xs"
                disabled={newTerm.category === key && (!newTerm.label.trim() || !newTerm.text.trim())}
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Ekle
              </Button>
            </div>
          </TabsContent>
        ))}

        <TabsContent value="other" className="space-y-2 mt-2">
          <div className="text-center py-4 text-muted-foreground border rounded-lg bg-muted/30">
            <p className="text-xs">Diğer şartlar bölümü yakında eklenecek...</p>
            <p className="text-xs mt-1 opacity-70">Bu bölümde özel şartlar yönetilebilecek</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};