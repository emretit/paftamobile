import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// PDFMe template designer component
import { PDFMeTemplateDesigner } from './template-designer/PDFMeTemplateDesigner';

interface Template {
  id: string;
  name: string;
  template_json: any;
  created_at: string;
  updated_at: string;
}

export const TemplateManagement: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    setSelectedTemplate(null);
    setIsEditing(true);
    setActiveTab('designer');
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setActiveTab('designer');
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`"${template.name}" şablonunu silmek istediğinizden emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      toast.success('Şablon silindi');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Şablon silinirken hata oluştu');
    }
  };

  const handlePreviewTemplate = async (template: Template) => {
    try {
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');

      // Mock data for preview
      const mockInputs = {
        companyName: 'ABC Teknoloji Ltd. Şti.',
        companyAddress: 'Merkez Mah. Teknoloji Cad. No:123 Şişli/İstanbul',
        companyPhone: 'Tel: (212) 555-0123',
        documentTitle: 'TEKLİF BELGESİ',
        quotationNumber: 'TKL-2025-001',
        quotationDate: new Date().toLocaleDateString('tr-TR'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
        customerName: 'XYZ İnşaat A.Ş.',
        customerAddress: 'Sanayi Mah. İnşaat Cad. No:456\nKadıköy/İstanbul',
        itemsHeader: 'ÜRÜN/HİZMET DETAYLARI',
        totalLabel: 'TOPLAM:',
        totalAmount: '125.000,00 ₺',
        paymentTerms: 'Ödeme Koşulları: 30 gün vadeli',
        notes: 'Bu teklif 30 gün geçerlidir.'
      };

      const pdf = await generate({
        template: template.template_json,
        inputs: [mockInputs],
        plugins: { text, image, qrcode: barcodes.qrcode } as any
      });

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Önizleme oluşturulamadı');
    }
  };

  const handleSaveTemplate = async (template: any) => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const templateName = selectedTemplate?.name || 'Yeni Şablon';

      if (selectedTemplate?.id) {
        // Update existing template
        const { error } = await supabase
          .from('templates')
          .update({ 
            name: templateName,
            template_json: template 
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Şablon güncellendi');
      } else {
        // Create new template
        const { error } = await supabase
          .from('templates')
          .insert({
            name: templateName,
            template_json: template,
            user_id: userRes.user.id
          });

        if (error) throw error;
        toast.success('Şablon kaydedildi');
      }

      setIsEditing(false);
      setActiveTab('list');
      loadTemplates();
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Şablon kaydedilemedi');
    }
  };

  // Create a ready-to-use default PDFMe template in DB
  // Kaldırıldı: Varsayılan şablon oluşturma
  const handleCreateDefaultTemplate = async () => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      const defaultTemplate = {
        basePdf: { width: 210, height: 297, padding: [30, 20, 30, 20] },
        schemas: [
          {
            companyHeader: {
              type: 'text', position: { x: 20, y: 10 }, width: 100, height: 8, fontSize: 12, fontColor: '#666666', content: 'Şirket Adı', readOnly: true
            },
            headerLine: {
              type: 'text', position: { x: 20, y: 18 }, width: 170, height: 1, fontSize: 8, backgroundColor: '#cccccc', content: ' ', readOnly: true
            },
            pageNumber: {
              type: 'text', position: { x: 150, y: 10 }, width: 40, height: 8, fontSize: 10, fontColor: '#666666', content: 'Sayfa {currentPage}/{totalPages}', readOnly: true
            }
          },
          {
            companyLogo: { type: 'image', position: { x: 20, y: 24 }, width: 20, height: 20 },
            companyName: { type: 'text', position: { x: 45, y: 24 }, width: 100, height: 10, fontSize: 16, fontColor: '#000000' },
            companyAddress: { type: 'text', position: { x: 45, y: 34 }, width: 100, height: 8, fontSize: 9, fontColor: '#444444' },
            companyContact: { type: 'text', position: { x: 45, y: 42 }, width: 100, height: 8, fontSize: 9, fontColor: '#444444' },
            proposalTitle: { type: 'text', position: { x: 20, y: 50 }, width: 170, height: 10, fontSize: 14, fontColor: '#000000' },
            customerName: { type: 'text', position: { x: 20, y: 70 }, width: 100, height: 8, fontSize: 12, fontColor: '#000000' },
            customerAddress: { type: 'text', position: { x: 20, y: 78 }, width: 100, height: 10, fontSize: 9, fontColor: '#444444' },
            customerTaxNo: { type: 'text', position: { x: 20, y: 88 }, width: 100, height: 8, fontSize: 9, fontColor: '#444444' },
            proposalNumber: { type: 'text', position: { x: 130, y: 70 }, width: 60, height: 8, fontSize: 10, fontColor: '#000000' },
            createdDate: { type: 'text', position: { x: 130, y: 78 }, width: 60, height: 8, fontSize: 9, fontColor: '#444444' },
            validUntil: { type: 'text', position: { x: 130, y: 86 }, width: 60, height: 8, fontSize: 9, fontColor: '#444444' },
            proposalItemsTable: {
              type: 'table', position: { x: 20, y: 100 }, width: 170, height: 50,
              content: '[["Ürün/Hizmet","Miktar","Birim","Birim Fiyat","Toplam"],["Web Sitesi","1","Adet","50.000 ₺","50.000 ₺"]]',
              showHead: true, head: [ 'Ürün/Hizmet', 'Miktar', 'Birim', 'Birim Fiyat', 'Toplam' ], headWidthPercentages: [40,15,15,15,15],
              tableStyles: { borderWidth: 0.5, borderColor: '#000000' }, headStyles: { fontSize: 10, fontColor: '#ffffff', backgroundColor: '#2980ba' }, bodyStyles: { fontSize: 9, fontColor: '#000000' }
            },
            subTotalLabel: { type: 'text', position: { x: 120, y: 152 }, width: 40, height: 6, fontSize: 9, fontColor: '#444444', content: 'Ara Toplam:' },
            subTotal: { type: 'text', position: { x: 160, y: 152 }, width: 30, height: 6, fontSize: 10, fontColor: '#000000' },
            discountLabel: { type: 'text', position: { x: 120, y: 160 }, width: 40, height: 6, fontSize: 9, fontColor: '#444444', content: 'İndirim:' },
            discountAmount: { type: 'text', position: { x: 160, y: 160 }, width: 30, height: 6, fontSize: 10, fontColor: '#000000' },
            netTotalLabel: { type: 'text', position: { x: 120, y: 168 }, width: 40, height: 6, fontSize: 9, fontColor: '#444444', content: 'Net Toplam:' },
            netTotal: { type: 'text', position: { x: 160, y: 168 }, width: 30, height: 6, fontSize: 12, fontColor: '#000000' },
            proposalQRCode: { type: 'qrcode', position: { x: 20, y: 160 }, width: 30, height: 30, backgroundColor: '#ffffff', color: '#000000' },
            proposalSummary: { type: 'text', position: { x: 60, y: 160 }, width: 130, height: 12, fontSize: 10, fontColor: '#333333' },
            termsHeader: { type: 'text', position: { x: 20, y: 200 }, width: 170, height: 8, fontSize: 10, fontColor: '#000000', content: 'Şartlar ve Koşullar' },
            termsText: { type: 'text', position: { x: 20, y: 208 }, width: 170, height: 60, fontSize: 9, fontColor: '#444444' }
          },
          {
            footerLine: { type: 'text', position: { x: 20, y: 280 }, width: 170, height: 1, fontSize: 8, backgroundColor: '#cccccc', content: ' ', readOnly: true },
            currentDate: { type: 'text', position: { x: 20, y: 285 }, width: 80, height: 8, fontSize: 9, fontColor: '#666666', content: '{date}', readOnly: true },
            companyFooter: { type: 'text', position: { x: 110, y: 285 }, width: 80, height: 8, fontSize: 9, fontColor: '#666666', content: 'www.sirketadi.com | info@sirketadi.com', readOnly: true }
          }
        ]
      } as any;

      const { error } = await supabase.from('templates').insert({
        name: 'Varsayılan Teklif Şablonu',
        template_json: defaultTemplate,
        user_id: userRes.user.id
      });
      if (error) throw error;
      toast.success('Varsayılan şablon eklendi');
      loadTemplates();
    } catch (err) {
      console.error('Create default template error:', err);
      toast.error('Varsayılan şablon eklenemedi');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-muted-foreground">Şablonlar yükleniyor...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">PDF Şablon Yönetimi</h2>
        <Button onClick={handleNewTemplate} className="flex items-center gap-2">
          <Plus size={16} />
          Yeni Şablon
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Şablon Listesi</TabsTrigger>
          <TabsTrigger value="designer" disabled={!isEditing}>
            {selectedTemplate ? 'Şablon Düzenle' : 'Yeni Şablon'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {templates.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Henüz şablon yok</h3>
              <p className="text-muted-foreground mb-4">
                Teklif PDF'leriniz için özel şablonlar oluşturun
              </p>
              <Button onClick={handleNewTemplate}>
                <Plus size={16} className="mr-2" />
                İlk Şablonunuzu Oluşturun
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{template.name}</h3>
                    <Badge variant="secondary">PDFMe</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    Güncelleme: {new Date(template.updated_at).toLocaleDateString('tr-TR')}
                  </p>
                  
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
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Bilgi kartı ve eski route kaldırıldı */}
        </TabsContent>

        <TabsContent value="designer">
          {isEditing && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {selectedTemplate ? `"${selectedTemplate.name}" Düzenleniyor` : 'Yeni Şablon Oluşturuluyor'}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setActiveTab('list');
                  }}>
                    İptal
                  </Button>
                </div>
              </div>
              
              <PDFMeTemplateDesigner
                initialTemplate={selectedTemplate?.template_json || null}
                onSave={handleSaveTemplate}
                onPreview={async (template) => {
                  // Preview with mock data
                  const mockInputs = {
                    companyName: 'ABC Teknoloji Ltd. Şti.',
                    documentTitle: 'TEKLİF BELGESİ',
                    quotationNumber: 'TKL-2025-001',
                    totalAmount: '125.000,00 ₺'
                  };

                  try {
                    const { generate } = await import('@pdfme/generator');
                    const { text, image, barcodes } = await import('@pdfme/schemas');
                    
                    const pdf = await generate({
                      template,
                      inputs: [mockInputs],
                      plugins: { text, image, qrcode: barcodes.qrcode } as any
                    });

                    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                  } catch (error) {
                    toast.error('Önizleme oluşturulamadı');
                  }
                }}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateManagement;
