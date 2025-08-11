import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SimpleTemplateEditor } from './SimpleTemplateEditor';

interface Template {
  id: string;
  name: string;
  template_json: any;
  created_at: string;
  updated_at: string;
}

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Load templates from database
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userRes.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Şablonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setActiveTab('editor');
  };

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
      
      await loadTemplates();
      toast.success('Şablon silindi');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Şablon silinirken hata oluştu');
    }
  };

  const handlePreviewTemplate = async (template: Template) => {
    try {
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');

      // Örnek veri
      const sampleInputs = {
        companyName: 'ABC Teknoloji Ltd. Şti.',
        proposalTitle: 'Web Sitesi Geliştirme Projesi',
        customerName: 'XYZ İnşaat A.Ş.',
        totalAmount: '125.000 ₺'
      };

      toast.info('PDF önizlemesi oluşturuluyor...');

      const pdf = await generate({
        template: template.template_json,
        inputs: [sampleInputs],
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode
        }
      });

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      toast.success('PDF önizlemesi oluşturuldu!');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Önizleme oluşturulamadı');
    }
  };

  const handleTemplateSaved = () => {
    loadTemplates();
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Şablon Yönetimi</h2>
        <p className="text-muted-foreground">
          PDF şablonlarını oluşturun, düzenleyin ve yönetin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Şablon Listesi</TabsTrigger>
          <TabsTrigger value="editor">Şablon Editörü</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mevcut Şablonlar</h3>
            <Button onClick={handleNewTemplate}>
              <Plus size={16} className="mr-2" />
              Yeni Şablon
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Henüz şablon yok</h3>
                <p className="text-muted-foreground mb-4">
                  PDF şablonları oluşturmak için başlayın
                </p>
                <Button onClick={handleNewTemplate}>
                  <Plus size={16} className="mr-2" />
                  İlk Şablonunuzu Oluşturun
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(template.updated_at).toLocaleDateString('tr-TR')} tarihinde güncellendi
                        </p>
                      </div>
                      <Badge variant="secondary">PDF Şablonu</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewTemplate(template)}
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
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
            onSave={handleTemplateSaved}
            onPreview={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};