import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit2, Trash2, Plus, FileText, Map } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SimpleTemplateEditor } from './SimpleTemplateEditor';
import { MappingPanel } from '@/components/pdf/MappingPanel';
import { TemplateBuilder } from '@/components/template-builder/TemplateBuilder';

interface Template {
  id: string;
  name: string;
  template_json: any;
  user_id: string;
  template_type: string;
  category: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  preview_image_url: string | null;
  variables: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMappingTemplate, setSelectedMappingTemplate] = useState<Template | null>(null);
  const [fieldMapping, setFieldMapping] = useState({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Şablonlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplateWithType = async (templateType: 'minimal' | 'standard' | 'detailed') => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        toast.error('Giriş yapmanız gerekiyor');
        return;
      }

      // Default template generator'ı import et
      const { generateDefaultTemplate, NEW_TEMPLATE_GUIDE, getTemplateCategory, getTemplateType } = await import('@/utils/defaultTemplateGenerator');
      
      // Seçilen türde template oluştur
      const defaultTemplate = generateDefaultTemplate({ templateType });
      const guide = NEW_TEMPLATE_GUIDE[templateType];

      const { error } = await supabase
        .from('templates')
        .insert({
          name: `${guide.name} - ${new Date().toLocaleDateString('tr-TR')}`,
          template_json: defaultTemplate,
          user_id: userRes.user.id,
          template_type: getTemplateType(), // 'proposal' olarak sabit
          category: getTemplateCategory(templateType), // 'general' olarak sabit
          description: `${guide.description} - ${guide.fields.length} alan içerir`,
          is_active: true,
          variables: []
        });

      if (error) throw error;

      toast.success(`${guide.name} oluşturuldu! Artık düzenleyebilirsiniz.`);
      loadTemplates();
    } catch (error) {
      console.error('Template oluşturma hatası:', error);
      toast.error('Şablon oluşturulamadı');
    }
  };

  const createSampleTemplate = () => createTemplateWithType('minimal');

  const handleGenerateTemplatePdf = async (template: Template) => {
    console.log('🚀 Template PDF Generate başlıyor...');
    console.log('Template:', template);
    
    try {
      const { generateAndDownloadPdf, generateSampleData } = await import('@/lib/pdf-utils');
      
      console.log('Template JSON:', template.template_json);
      
      // Örnek veriler oluştur
      const sampleInputs = generateSampleData(template.template_json);
      console.log('Sample inputs:', sampleInputs);
      
      // PDF oluştur ve indir
      console.log('PDF oluşturuluyor...');
      await generateAndDownloadPdf(template.template_json, sampleInputs, template.name);
      console.log('✅ PDF başarıyla oluşturuldu');
    } catch (error: any) {
      console.error('❌ Template PDF Generate hatası:', error);
      console.error('Error stack:', error.stack);
      toast.error(`PDF oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
    }
  };

  function defaultSampleFor(field: string) {
    const f = field.toLowerCase();
    if (f.includes('company')) return 'NGS TEKNOLOJİ';
    if (f.includes('title') || f.includes('baslik')) return 'TEKLİF FORMU';
    if (f.includes('name') || f.includes('musteri')) return 'ÖRNEK MÜŞTERİ';
    if (f.includes('date') || f.includes('tarih')) return new Date().toLocaleDateString('tr-TR');
    if (f.includes('total') || f.includes('amount') || f.includes('tutar')) return '8.260,00 ₺';
    return `Örnek ${field}`;
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setActiveTab('editor');
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Şablon silindi');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Şablon silinirken hata oluştu');
    }
  };

  const handleTemplateSaved = () => {
    loadTemplates();
    setActiveTab('list');
    setEditingTemplate(null);
  };

  const handleMappingTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedMappingTemplate(template || null);
    // Load existing field mapping if available
    if (template?.metadata?.fieldMapping) {
      setFieldMapping(template.metadata.fieldMapping);
    } else {
      setFieldMapping({});
    }
  };

  const handleMappingChange = (newMapping: any) => {
    setFieldMapping(newMapping);
  };

  const handleMappingSave = async (mapping: any) => {
    if (!selectedMappingTemplate) {
      toast.error('Şablon seçmelisiniz');
      return;
    }

    try {
      const updatedMetadata = {
        ...selectedMappingTemplate.metadata,
        fieldMapping: mapping
      };

      const { error } = await supabase
        .from('templates')
        .update({ metadata: updatedMetadata })
        .eq('id', selectedMappingTemplate.id);

      if (error) throw error;

      toast.success('Field mapping kaydedildi');
      loadTemplates();
    } catch (error) {
      console.error('Error saving field mapping:', error);
      toast.error('Field mapping kaydedilemedi');
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedType === 'all') return true;
    return template.template_type === selectedType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Şablonlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Şablon Listesi</TabsTrigger>
          <TabsTrigger value="editor">Şablon Editörü</TabsTrigger>
          <TabsTrigger value="builder">Şablon Tasarımcısı</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">PDF Şablonları</h2>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tüm Tipler</option>
                <option value="proposal">Teklif</option>
                <option value="invoice">Fatura</option>
                <option value="contract">Sözleşme</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={() => { setEditingTemplate(null); setActiveTab('editor'); }}>
                  + Boş Şablon
                </Button>
                <Button onClick={() => { setEditingTemplate(null); setActiveTab('builder'); }} variant="default">
                  🎨 Tasarımcı
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Test butonu tıklandı');
                    toast.success('Test başarılı!');
                  }} 
                  variant="outline"
                  className="bg-green-50"
                >
                  🧪 Test
                </Button>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Hazır Şablonlar:</div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => createTemplateWithType('minimal')} 
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Minimal (8 alan)
                  </Button>
                  <Button 
                    onClick={() => createTemplateWithType('standard')} 
                    variant="outline"
                    size="sm" 
                    className="flex-1"
                  >
                    Standart (15 alan)
                  </Button>
                  <Button 
                    onClick={() => createTemplateWithType('detailed')} 
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Detaylı (25 alan)
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <div><strong>Minimal:</strong> Sadece zorunlu alanlar (proposalNumber, customerName, totalAmount...)</div>
                  <div><strong>Standart:</strong> En çok kullanılan alanlar + şirket/müşteri detayları</div>
                  <div><strong>Detaylı:</strong> Tüm alanları içerir (logo, adres, telefon, notlar...)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <div className="flex gap-1">
                      {template.template_type && (
                        <Badge variant="secondary" className="text-xs">
                          {template.template_type === 'proposal' ? 'Teklif' : 
                           template.template_type === 'invoice' ? 'Fatura' : 
                           template.template_type === 'contract' ? 'Sözleşme' : 'Diğer'}
                        </Badge>
                      )}
                      {template.is_default && (
                        <Badge variant="default" className="text-xs">Varsayılan</Badge>
                      )}
                    </div>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Oluşturulma: {new Date(template.created_at).toLocaleDateString('tr-TR')}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateTemplatePdf(template)}
                        className="flex-1"
                      >
                        <Eye size={14} className="mr-1" />
                        Önizle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Editör
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setEditingTemplate(template);
                        setActiveTab('builder');
                      }}
                      className="w-full"
                    >
                      🎨 Tasarımcıda Düzenle
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz şablon bulunmuyor.</p>
              <Button 
                onClick={() => { setEditingTemplate(null); setActiveTab('editor'); }}
                className="mt-4"
              >
                İlk Şablonunuzu Oluşturun
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editingTemplate ? 'Şablon Düzenle' : 'Yeni Şablon Oluştur'}
            </h3>
            <Button variant="outline" onClick={() => setActiveTab('list')}>
              ← Listeye Dön
            </Button>
          </div>
          <SimpleTemplateEditor
            initialTemplate={editingTemplate?.template_json}
            initialName={editingTemplate?.name}
            templateId={editingTemplate?.id}
            onSave={handleTemplateSaved}
          />
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Şablon Tasarımcısı</h3>
              <p className="text-sm text-muted-foreground">
                Hazır elementleri sürükleyip bırakarak profesyonel PDF şablonları oluşturun
              </p>
            </div>
            <Button variant="outline" onClick={() => setActiveTab('list')}>
              ← Listeye Dön
            </Button>
          </div>
          <TemplateBuilder
            initialTemplate={editingTemplate?.template_json}
            onTemplateChange={(template) => {
              if (editingTemplate) {
                setEditingTemplate(prev => prev ? { ...prev, template_json: template } : null);
              }
            }}
            onSave={async (template, name) => {
              try {
                const { data: userRes } = await supabase.auth.getUser();
                if (!userRes.user) {
                  toast.error('Giriş yapmanız gerekiyor');
                  return;
                }

                if (editingTemplate) {
                  // Mevcut şablonu güncelle
                  const { error } = await supabase
                    .from('templates')
                    .update({
                      name: name,
                      template_json: template,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', editingTemplate.id);

                  if (error) throw error;
                  toast.success('Şablon güncellendi');
                } else {
                  // Yeni şablon oluştur
                  const { error } = await supabase
                    .from('templates')
                    .insert({
                      name: name,
                      template_json: template,
                      user_id: userRes.user.id,
                      template_type: 'proposal',
                      category: 'general',
                      description: `Şablon tasarımcısı ile oluşturuldu`,
                      is_active: true,
                      variables: []
                    });

                  if (error) throw error;
                  toast.success('Şablon oluşturuldu');
                }

                handleTemplateSaved();
              } catch (error) {
                console.error('Şablon kaydetme hatası:', error);
                toast.error('Şablon kaydedilemedi');
              }
            }}
          />
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Field Mapping</h3>
            <Button variant="outline" onClick={() => setActiveTab('list')}>
              ← Listeye Dön
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Şablon Field Mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Şablon Seçin:</label>
                <Select onValueChange={handleMappingTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Field mapping yapılacak şablonu seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.template_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMappingTemplate && (
                <div className="mt-6">
                  <MappingPanel
                    template={selectedMappingTemplate.template_json}
                    initialMapping={fieldMapping}
                    onChange={handleMappingChange}
                    onSave={handleMappingSave}
                    isLoading={false}
                  />
                </div>
              )}

              {!selectedMappingTemplate && (
                <div className="text-center py-8 text-muted-foreground">
                  <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Field mapping yapmak için yukarıdan bir şablon seçin.</p>
                  <p className="text-sm mt-2">Şablon fieldları veritabanı kolonlarıyla eşleştirebilirsiniz.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};