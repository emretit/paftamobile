import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { PDFViewer } from '@react-pdf/renderer';
import { Download, Save, Star, Eye, EyeOff } from 'lucide-react';
import { TemplateSchema, PdfTemplate, QuoteData, CustomTextField } from '@/types/pdf-template';
import PdfRenderer from '@/components/pdf/PdfRenderer';
import { PdfExportService } from '@/services/pdf/pdfExportService';
import { LogoUploadField } from '@/components/templates/LogoUploadField';
import { CustomTextFields } from '@/components/templates/CustomTextFields';
import { toast } from 'sonner';

const PdfTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<QuoteData | null>(null);

  const form = useForm<TemplateSchema>({
    resolver: zodResolver(z.object({
      page: z.object({
        size: z.enum(['A4', 'A3', 'Letter']),
        padding: z.object({
          top: z.number().min(10).max(100),
          right: z.number().min(10).max(100),
          bottom: z.number().min(10).max(100),
          left: z.number().min(10).max(100),
        }),
        fontSize: z.number().min(8).max(20),
      }),
      header: z.object({
        title: z.string().min(1),
        showLogo: z.boolean(),
        logoUrl: z.string().optional(),
        showValidity: z.boolean(),
      }),
      customerBlock: z.object({
        show: z.boolean(),
        fields: z.array(z.string()),
      }),
      lineTable: z.object({
        columns: z.array(z.object({
          key: z.string(),
          show: z.boolean(),
          label: z.string(),
          align: z.enum(['left', 'center', 'right']),
        })),
      }),
      totals: z.object({
        showGross: z.boolean(),
        showDiscount: z.boolean(),
        showTax: z.boolean(),
        showNet: z.boolean(),
      }),
      notes: z.object({
        intro: z.string(),
        footer: z.string(),
        customFields: z.array(z.object({
          id: z.string(),
          label: z.string(),
          text: z.string(),
          position: z.enum(['header', 'footer', 'before-table', 'after-table']),
          style: z.object({
            fontSize: z.number().optional(),
            align: z.enum(['left', 'center', 'right']).optional(),
            bold: z.boolean().optional(),
            color: z.string().optional(),
          }).optional(),
        })).optional(),
      }),
    })),
    defaultValues: {
      page: {
        size: 'A4',
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        fontSize: 12,
      },
      header: {
        title: 'TEKLİF',
        showLogo: true,
        logoUrl: undefined,
        showValidity: true,
      },
      customerBlock: {
        show: true,
        fields: ['name', 'company', 'email', 'mobile_phone', 'address'],
      },
      lineTable: {
        columns: [
          { key: 'description', show: true, label: 'Açıklama', align: 'left' },
          { key: 'quantity', show: true, label: 'Miktar', align: 'center' },
          { key: 'unit_price', show: true, label: 'Birim Fiyat', align: 'right' },
          { key: 'total', show: true, label: 'Toplam', align: 'right' },
        ],
      },
      totals: {
        showGross: true,
        showDiscount: true,
        showTax: true,
        showNet: true,
      },
      notes: {
        intro: 'Bu teklif 30 gün geçerlidir.',
        footer: 'İyi çalışmalar dileriz.',
        customFields: [],
      },
    },
  });

  useEffect(() => {
    loadTemplates();
    loadSampleData();
  }, []);

  const loadTemplates = async () => {
    try {
      const templates = await PdfExportService.getTemplates();
      setTemplates(templates);
      
      // Set default template if available
      const defaultTemplate = templates.find(t => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
        form.reset(defaultTemplate.schema_json);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Şablonlar yüklenirken hata oluştu');
    }
  };

  const loadSampleData = async () => {
    try {
      const companySettings = await PdfExportService.getCompanySettings();
      const sampleData: QuoteData = {
        number: 'TEK-2024-001',
        title: 'Örnek Teklif',
        date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: 'Örnek Müşteri',
          company: 'Örnek Şirket A.Ş.',
          email: 'info@ornek.com',
          mobile_phone: '+90 212 555 0123',
          address: 'İstanbul, Türkiye',
        },
        items: [
          {
            id: '1',
            description: 'Ürün/Hizmet 1',
            quantity: 2,
            unit: 'adet',
            unit_price: 100.00,
            total: 200.00,
          },
          {
            id: '2',
            description: 'Ürün/Hizmet 2',
            quantity: 1,
            unit: 'paket',
            unit_price: 150.00,
            total: 150.00,
          },
        ],
        subtotal: 350.00,
        total_discount: 35.00,
        total_tax: 63.00,
        total_amount: 378.00,
        currency: 'TRY',
        notes: 'Bu bir örnek tekliftir.',
        payment_terms: '30 gün vadeli',
        delivery_terms: '1 hafta içinde',
        warranty_terms: '1 yıl garanti',
        id: 'sample-1',
        created_at: new Date().toISOString(),
      };
      setPreviewData(sampleData);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const handleSave = async (data: TemplateSchema) => {
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    try {
      const updatedTemplate: Omit<PdfTemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: selectedTemplate.name,
        type: selectedTemplate.type,
        locale: selectedTemplate.locale,
        schema_json: data,
        version: selectedTemplate.version + 1,
        is_default: selectedTemplate.is_default,
        created_by: selectedTemplate.created_by,
      };
      
      await PdfExportService.saveTemplate(updatedTemplate);
      toast.success('Şablon başarıyla kaydedildi');
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Şablon kaydedilirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async () => {
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    try {
      await PdfExportService.setAsDefault(selectedTemplate.id, selectedTemplate.type);
      toast.success('Varsayılan şablon olarak ayarlandı');
      await loadTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      toast.error('Varsayılan şablon ayarlanırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewData || !selectedTemplate) return;
    
    setIsLoading(true);
    try {
      await PdfExportService.downloadPdf(previewData, { templateId: selectedTemplate.id });
      toast.success('PDF başarıyla indirildi');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('PDF indirilirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };


  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      form.reset(template.schema_json);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PDF Şablon Editörü</h1>
            <p className="text-muted-foreground">PDF şablonlarını özelleştirin ve önizleyin</p>
          </div>
          
          {/* Template Selection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="template-select">Şablon:</Label>
              <Select value={selectedTemplate?.id} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Şablon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.is_default && '(Varsayılan)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Settings Panel */}
          <ResizablePanel defaultSize={35} minSize={30}>
            <div className="h-full overflow-y-auto bg-gradient-to-b from-background to-background/95 border-r border-border/10">
              <div className="p-6 space-y-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/20 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Şablon Ayarları
                  </h3>
                  <p className="text-sm text-muted-foreground">PDF şablonunuzu özelleştirin ve önizlemesini gerçek zamanlı olarak görün.</p>
                </div>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">{/*  */}
                {/* Page Settings */}
                <Accordion type="single" collapsible defaultValue="page">
                  <AccordionItem value="page">
                    <AccordionTrigger>Sayfa Ayarları</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Sayfa Boyutu</Label>
                          <Select value={watchedValues.page?.size} onValueChange={(value) => form.setValue('page.size', value as any)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Font Boyutu</Label>
                          <Input
                            type="number"
                            {...form.register('page.fontSize', { valueAsNumber: true })}
                            min="8"
                            max="20"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Üst Boşluk</Label>
                          <Input
                            type="number"
                            {...form.register('page.padding.top', { valueAsNumber: true })}
                            min="10"
                            max="100"
                          />
                        </div>
                        <div>
                          <Label>Sağ Boşluk</Label>
                          <Input
                            type="number"
                            {...form.register('page.padding.right', { valueAsNumber: true })}
                            min="10"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Alt Boşluk</Label>
                          <Input
                            type="number"
                            {...form.register('page.padding.bottom', { valueAsNumber: true })}
                            min="10"
                            max="100"
                          />
                        </div>
                        <div>
                          <Label>Sol Boşluk</Label>
                          <Input
                            type="number"
                            {...form.register('page.padding.left', { valueAsNumber: true })}
                            min="10"
                            max="100"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Header Settings */}
                <Accordion type="single" collapsible defaultValue="header">
                  <AccordionItem value="header">
                    <AccordionTrigger>Başlık Ayarları</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <Label>Başlık Metni</Label>
                        <Input {...form.register('header.title')} />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-logo"
                          checked={watchedValues.header?.showLogo}
                          onCheckedChange={(checked) => form.setValue('header.showLogo', checked)}
                        />
                        <Label htmlFor="show-logo">Logo Göster</Label>
                      </div>
                      
                      {watchedValues.header?.showLogo && (
                        <LogoUploadField
                          logoUrl={watchedValues.header?.logoUrl}
                          onLogoChange={(url) => form.setValue('header.logoUrl', url || undefined)}
                        />
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-validity"
                          checked={watchedValues.header?.showValidity}
                          onCheckedChange={(checked) => form.setValue('header.showValidity', checked)}
                        />
                        <Label htmlFor="show-validity">Geçerlilik Tarihi Göster</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Customer Block Settings */}
                <Accordion type="single" collapsible defaultValue="customer">
                  <AccordionItem value="customer">
                    <AccordionTrigger>Müşteri Bilgileri</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-customer"
                          checked={watchedValues.customerBlock?.show}
                          onCheckedChange={(checked) => form.setValue('customerBlock.show', checked)}
                        />
                        <Label htmlFor="show-customer">Müşteri Bilgilerini Göster</Label>
                      </div>
                      
                      {watchedValues.customerBlock?.show && (
                        <div className="space-y-2">
                          <Label>Gösterilecek Alanlar</Label>
                          {['name', 'company', 'email', 'mobile_phone', 'office_phone', 'address'].map((field) => (
                            <div key={field} className="flex items-center space-x-2">
                              <Switch
                                id={`show-${field}`}
                                checked={watchedValues.customerBlock?.fields?.includes(field as any)}
                                onCheckedChange={(checked) => {
                                  const currentFields = watchedValues.customerBlock?.fields || [];
                                  if (checked) {
                                    form.setValue('customerBlock.fields', [...currentFields, field as any]);
                                  } else {
                                    form.setValue('customerBlock.fields', currentFields.filter(f => f !== field));
                                  }
                                }}
                              />
                              <Label htmlFor={`show-${field}`} className="capitalize">
                                {field === 'name' ? 'Ad Soyad' : 
                                 field === 'company' ? 'Şirket' : 
                                 field === 'email' ? 'E-posta' : 
                                 field === 'mobile_phone' ? 'Cep Telefonu' :
                                 field === 'office_phone' ? 'Sabit Telefon' : 'Adres'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Line Table Settings */}
                <Accordion type="single" collapsible defaultValue="table">
                  <AccordionItem value="table">
                    <AccordionTrigger>Tablo Ayarları</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {watchedValues.lineTable?.columns?.map((column, index) => (
                        <div key={column.key} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">{column.label}</Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`show-${column.key}`}
                                checked={column.show}
                                onCheckedChange={(checked) => {
                                  const newColumns = [...(watchedValues.lineTable?.columns || [])];
                                  newColumns[index].show = checked;
                                  form.setValue('lineTable.columns', newColumns);
                                }}
                              />
                              {column.show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </div>
                          </div>
                          
                          {column.show && (
                            <>
                              <div>
                                <Label>Etiket</Label>
                                <Input
                                  value={column.label}
                                  onChange={(e) => {
                                    const newColumns = [...(watchedValues.lineTable?.columns || [])];
                                    newColumns[index].label = e.target.value;
                                    form.setValue('lineTable.columns', newColumns);
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Hizalama</Label>
                                <Select
                                  value={column.align}
                                  onValueChange={(value) => {
                                    const newColumns = [...(watchedValues.lineTable?.columns || [])];
                                    newColumns[index].align = value as any;
                                    form.setValue('lineTable.columns', newColumns);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Sol</SelectItem>
                                    <SelectItem value="center">Orta</SelectItem>
                                    <SelectItem value="right">Sağ</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Totals Settings */}
                <Accordion type="single" collapsible defaultValue="totals">
                  <AccordionItem value="totals">
                    <AccordionTrigger>Toplam Ayarları</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-gross"
                          checked={watchedValues.totals?.showGross}
                          onCheckedChange={(checked) => form.setValue('totals.showGross', checked)}
                        />
                        <Label htmlFor="show-gross">Ara Toplam Göster</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-discount"
                          checked={watchedValues.totals?.showDiscount}
                          onCheckedChange={(checked) => form.setValue('totals.showDiscount', checked)}
                        />
                        <Label htmlFor="show-discount">İndirim Göster</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-tax"
                          checked={watchedValues.totals?.showTax}
                          onCheckedChange={(checked) => form.setValue('totals.showTax', checked)}
                        />
                        <Label htmlFor="show-tax">KDV Göster</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-net"
                          checked={watchedValues.totals?.showNet}
                          onCheckedChange={(checked) => form.setValue('totals.showNet', checked)}
                        />
                        <Label htmlFor="show-net">Genel Toplam Göster</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Notes Settings */}
                <Accordion type="single" collapsible defaultValue="notes">
                  <AccordionItem value="notes">
                    <AccordionTrigger>Not Ayarları</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <Label>Giriş Notu</Label>
                        <Textarea {...form.register('notes.intro')} rows={3} />
                      </div>
                      
                      <div>
                        <Label>Alt Bilgi</Label>
                        <Textarea {...form.register('notes.footer')} rows={3} />
                      </div>
                      
                      <div className="border-t pt-4">
                        <CustomTextFields
                          fields={watchedValues.notes?.customFields || []}
                          onFieldsChange={(fields) => form.setValue('notes.customFields', fields)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSetDefault}
                    disabled={isLoading || !selectedTemplate?.is_default}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Varsayılan Yap
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadPdf}
                    disabled={isLoading || !previewData || !selectedTemplate}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF İndir
                  </Button>
                  
                </div>
                </form>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* PDF Preview */}
          <ResizablePanel defaultSize={65} minSize={50}>
            <div className="h-full p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    PDF Önizleme
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0">
                  {previewData && watchedValues ? (
                    <div className="h-full">
                      <PDFViewer className="w-full h-full">
                        <PdfRenderer data={previewData} schema={watchedValues} />
                      </PDFViewer>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      PDF önizlemesi yükleniyor...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default PdfTemplateEditor;