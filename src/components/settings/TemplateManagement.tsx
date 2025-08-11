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
  user_id: string;
  name: string;
  template_json: any;
  template_type?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  preview_image_url?: string;
  variables?: any[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

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

  const createSampleTemplate = async () => {
    try {
      // Kullanıcı doğrulaması
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Lütfen giriş yapın');
        return;
      }

      // Örnek şablon oluştur
      const sampleTemplate = {
        user_id: user.id,
        name: `Örnek Şablon - ${new Date().toLocaleDateString('tr-TR')}`,
        template_json: {
          basePdf: "BLANK_PDF",
          schemas: [
            {
              "companyName": {
                "type": "text",
                "position": { "x": 20, "y": 20 },
                "width": 160,
                "height": 10,
                "fontSize": 18,
                "fontColor": "#000000"
              },
              "proposalTitle": {
                "type": "text",
                "position": { "x": 20, "y": 40 },
                "width": 160,
                "height": 8,
                "fontSize": 14,
                "fontColor": "#666666"
              },
              "customerName": {
                "type": "text",
                "position": { "x": 20, "y": 60 },
                "width": 100,
                "height": 8,
                "fontSize": 12,
                "fontColor": "#000000"
              },
              "totalAmount": {
                "type": "text",
                "position": { "x": 20, "y": 80 },
                "width": 80,
                "height": 8,
                "fontSize": 16,
                "fontColor": "#ff6b35"
              }
            }
          ]
        },
        template_type: 'proposal',
        category: 'general',
        description: 'Otomatik oluşturulan örnek şablon - PDFme ile düzenlenebilir',
        is_active: true,
        variables: [
          { name: 'companyName', label: 'Şirket Adı', type: 'text' },
          { name: 'proposalTitle', label: 'Teklif Başlığı', type: 'text' },
          { name: 'customerName', label: 'Müşteri Adı', type: 'text' },
          { name: 'totalAmount', label: 'Toplam Tutar', type: 'currency' }
        ]
      };

      const { error } = await supabase
        .from('templates')
        .insert([sampleTemplate]);

      if (error) throw error;

      toast.success('Örnek şablon oluşturuldu!');
      await loadTemplates();
    } catch (error) {
      console.error('Örnek şablon oluşturma hatası:', error);
      toast.error('Örnek şablon oluşturulamadı');
    }
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
      console.log('🎯 Preview başlatılıyor...', template.name);
      
      // PDF oluşturucu ve şemalar
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime } = await import('@pdfme/schemas');
      const { BLANK_PDF } = await import('@pdfme/common');

      // Bazı şablonlarda basePdf string olarak tutulmuş olabilir -> gerçek BLANK_PDF ile değiştir
      const preparedTemplate: any = JSON.parse(JSON.stringify(template.template_json || {}));
      if (preparedTemplate && preparedTemplate.basePdf === 'BLANK_PDF') {
        console.log('📄 basePdf string\'i gerçek BLANK_PDF ile değiştiriliyor');
        preparedTemplate.basePdf = BLANK_PDF;
      }

      // Şablondaki alanlara göre akıllı örnek veri hazırla
      const sampleInputs: Record<string, any> = {};
      if (preparedTemplate.schemas && preparedTemplate.schemas[0]) {
        Object.keys(preparedTemplate.schemas[0]).forEach((key) => {
          switch (key) {
            case 'companyName':
              sampleInputs[key] = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ';
              break;
            case 'companyAddress':
              sampleInputs[key] = 'Eğitim Mah. Muratpaşa Cad. No:1 D:29-30\nKadıköy, İstanbul 34000\nTel: 0 (212) 577 35 72';
              break;
            case 'proposalTitle':
              sampleInputs[key] = 'TEKLİF FORMU';
              break;
            case 'proposalNumber':
              sampleInputs[key] = 'Teklif No: NT.2025-001';
              break;
            case 'proposalDate':
              sampleInputs[key] = 'Tarih: ' + new Date().toLocaleDateString('tr-TR');
              break;
            case 'customerHeader':
              sampleInputs[key] = 'Müşteri Bilgileri:';
              break;
            case 'itemsHeader':
              sampleInputs[key] = 'Teklif Edilen Ürün/Hizmetler:';
              break;
            case 'subtotalLabel':
              sampleInputs[key] = 'Ara Toplam:';
              break;
            case 'subtotalAmount':
              sampleInputs[key] = '7,000.00 $';
              break;
            case 'taxLabel':
              sampleInputs[key] = 'KDV (%18):';
              break;
            case 'taxAmount':
              sampleInputs[key] = '1,260.00 $';
              break;
            case 'totalLabel':
              sampleInputs[key] = 'GENEL TOPLAM:';
              break;
            case 'totalAmount':
              sampleInputs[key] = '8,260.00 $';
              break;
            case 'termsHeader':
              sampleInputs[key] = 'Şartlar ve Koşullar:';
              break;
            case 'paymentTerms':
              sampleInputs[key] = '• Ödeme: %50 peşin, %50 iş bitimi\n• Teslimat: Siparişe müteakip 10 iş günü\n• Garanti: 2 yıl üretici garantisi';
              break;
            case 'validityPeriod':
              sampleInputs[key] = 'Bu teklif 30 gün geçerlidir.';
              break;
            case 'signature':
              sampleInputs[key] = 'Saygılarımızla,\n\nNGS Teknoloji\nSatış Departmanı';
              break;
            case 'footer':
              sampleInputs[key] = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ | www.ngsteknoloji.com | info@ngsteknoloji.com';
              break;
            // Yeni PDFme araçları için mapping'ler
            case 'title':
              sampleInputs[key] = 'TEKLİF FORMU';
              break;
            case 'companyInfo':
              sampleInputs[key] = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ\\nEğitim Mah. Muratpaşa Cad. No:1\\nKadıköy, İstanbul\\nTel: 0 (212) 577 35 72';
              break;
            case 'currentDate':
              sampleInputs[key] = new Date().toISOString().split('T')[0];
              break;
            case 'urgentCheckbox':
              sampleInputs[key] = true;
              break;
            case 'urgentLabel':
              sampleInputs[key] = 'ACİL';
              break;
            case 'priorityOptions':
              sampleInputs[key] = 'Yüksek';
              break;
            case 'serviceType':
              sampleInputs[key] = 'Güvenlik Sistemi';
              break;
            case 'qrCode':
              sampleInputs[key] = 'https://ngsteknoloji.com/teklif/NT.2025-001';
              break;
            case 'barcode':
              sampleInputs[key] = '123456789012';
              break;
            case 'approvalText':
              sampleInputs[key] = 'ONAY';
              break;
            case 'signatureField':
              sampleInputs[key] = '';
              break;
            case 'signatureLabel':
              sampleInputs[key] = 'Müşteri İmzası';
              break;
            case 'head':
              sampleInputs[key] = 'QUOTE';
              break;
            case 'invoiceHeader':
              sampleInputs[key] = 'INVOICE';
              break;
            case 'customerName':
            case 'preparedForInput':
            case 'customerInfo':
              sampleInputs[key] = 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ\nBahçeşehir Mah. Boğazköy Cad.\nBaşakşehir, İstanbul\nİletişim: 0555 123 45 67';
              break;
            case 'preparedForLabel':
              sampleInputs[key] = 'Prepared for:';
              break;
            case 'quoteInfo':
              sampleInputs[key] = 'Quote No: 12345\\n18 June 2025\\nValid Until: 16 July 2025';
              break;
            case 'subtotalLabel':
              sampleInputs[key] = 'Subtotal';
              break;
            case 'subtotal':
              sampleInputs[key] = '377';
              break;
            case 'taxInput':
              sampleInputs[key] = 'Tax (10%)';
              break;
            case 'tax':
              sampleInputs[key] = '37.7';
              break;
            case 'totalLabel':
              sampleInputs[key] = 'Total';
              break;
            case 'total':
            case 'totalAmount':
              sampleInputs[key] = '$414.7';
              break;
            case 'thankyou':
              sampleInputs[key] = 'Thank you for your interest!';
              break;
            case 'invoiceDetails':
              sampleInputs[key] = 'Invoice #: INV-2025-001\\nDate: ' + new Date().toLocaleDateString('en-US');
              break;
            case 'billToHeader':
              sampleInputs[key] = 'Bill To:';
              break;
            case 'subtotalSection':
              sampleInputs[key] = 'Subtotal: $9,200.00\\nTax (18%): $1,656.00';
              break;
            case 'paymentTerms':
              sampleInputs[key] = 'Payment Terms: Net 30 days.';
              break;
            case 'footer':
              sampleInputs[key] = 'Thank you for your business! | www.ngsteknoloji.com';
              break;
            default:
              sampleInputs[key] = `Örnek ${key}`;
          }
        });
      } else {
        // Fallback örnek veriler
        sampleInputs.companyName = 'NGS TEKNOLOJİ';
        sampleInputs.proposalTitle = 'TEKLİF FORMU';
        sampleInputs.customerName = 'ÖRNEK MÜŞTERİ';
        sampleInputs.totalAmount = '125.000 ₺';
      }

      console.log('📊 Örnek veriler hazırlandı:', Object.keys(sampleInputs));
      toast.info('PDF önizlemesi oluşturuluyor...');

      console.log('🏗️ PDF oluşturuluyor...');
      const pdf = await generate({
        template: preparedTemplate,
        inputs: [sampleInputs],
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode,
          ean13: barcodes.ean13,
          japanpost: barcodes.japanpost,
          line,
          rectangle,
          ellipse,
          table,
          checkbox,
          radioGroup,
          select,
          multiVariableText,
          dateTime,
        } as any,
      });

      console.log('✅ PDF oluşturuldu! Boyut:', pdf.buffer.byteLength, 'bytes');
      
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      console.log('🚀 PDF yeni sekmede açılıyor...');
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        console.warn('⚠️ Popup engellendi, indirme alternatifi sunuluyor');
        toast.error('Popup engellendi. PDF indiriliyor...');
        
        // Alternatif: Download linki
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name}-onizleme-${Date.now()}.pdf`;
        link.click();
        toast.success('PDF indirildi!');
      } else {
        toast.success('PDF önizlemesi oluşturuldu! 🎉');
      }

      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
    } catch (error: any) {
      console.error('❌ Preview hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        stack: error.stack,
        template: template.name
      });
      toast.error(`Önizleme oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Mevcut Şablonlar</h3>
            <div className="flex gap-2">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tüm Şablonlar</option>
                <option value="proposal">Teklifler</option>
                <option value="invoice">Faturalar</option>
                <option value="contract">Sözleşmeler</option>
                <option value="other">Diğer</option>
              </select>
              <Button onClick={handleNewTemplate}>
                <Plus size={16} className="mr-2" />
                Yeni Şablon
              </Button>
              <Button variant="outline" onClick={createSampleTemplate}>
                🎯 Örnek Şablon
              </Button>
            </div>
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
                {templates.filter(template => 
                  selectedType === 'all' || template.template_type === selectedType
                ).map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.template_type === 'proposal' ? 'bg-blue-100 text-blue-800' :
                            template.template_type === 'invoice' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {template.template_type === 'proposal' ? 'Teklif' :
                             template.template_type === 'invoice' ? 'Fatura' : 
                             template.template_type || 'Diğer'}
                          </span>
                          {template.is_default && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description || 'Açıklama yok'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
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
            initialTemplate={editingTemplate?.template_json}
            initialName={editingTemplate?.name}
            templateId={editingTemplate?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};