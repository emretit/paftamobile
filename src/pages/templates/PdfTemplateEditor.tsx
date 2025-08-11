import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Download, Upload, Settings, Eye } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { TemplateSchema, PdfTemplate, QuoteData } from '@/types/pdf-template';
import PdfRenderer from '@/components/pdf/PdfRenderer';
import { PdfExportService } from '@/services/pdf/pdfExportService';

// Validation schema
const templateFormSchema = z.object({
  name: z.string().min(1, 'Şablon adı gereklidir'),
  type: z.enum(['quote', 'invoice', 'proposal']),
  locale: z.enum(['tr', 'en']),
  schema_json: z.object({
    page: z.object({
      size: z.enum(['A4', 'A3', 'Letter']),
      padding: z.object({
        top: z.number().min(0),
        right: z.number().min(0),
        bottom: z.number().min(0),
        left: z.number().min(0),
      }),
      fontSize: z.number().min(8).max(20),
    }),
    header: z.object({
      showLogo: z.boolean(),
      title: z.string(),
      showValidity: z.boolean(),
    }),
    customerBlock: z.object({
      show: z.boolean(),
      fields: z.array(z.enum(['name', 'company', 'email', 'phone', 'address', 'tax_number', 'tax_office'])),
    }),
    lineTable: z.object({
      columns: z.array(z.object({
        key: z.string(),
        label: z.string(),
        show: z.boolean(),
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
      intro: z.string().optional(),
      footer: z.string().optional(),
    }),
  }),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const PdfTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<QuoteData | null>(null);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      type: 'quote',
      locale: 'tr',
      schema_json: {
        page: {
          size: 'A4',
          padding: { top: 40, right: 40, bottom: 40, left: 40 },
          fontSize: 12,
        },
        header: {
          showLogo: true,
          title: 'TEKLİF',
          showValidity: true,
        },
        customerBlock: {
          show: true,
          fields: ['name', 'company', 'email', 'phone', 'address'],
        },
        lineTable: {
          columns: [
            { key: 'description', label: 'Açıklama', show: true, align: 'left' },
            { key: 'quantity', label: 'Miktar', show: true, align: 'center' },
            { key: 'unit_price', label: 'Birim Fiyat', show: true, align: 'right' },
            { key: 'total', label: 'Toplam', show: true, align: 'right' },
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
        },
      },
    },
  });

  // Sample data for preview
  const sampleQuoteData: QuoteData = {
    id: 'sample-1',
    number: 'TKL-2024-001',
    title: 'Örnek Teklif',
    description: 'Bu bir örnek tekliftir.',
    customer: {
      name: 'Ahmet Yılmaz',
      company: 'ABC Şirketi',
      email: 'ahmet@abc.com',
      mobile_phone: '+90 555 123 45 67',
      address: 'Örnek Mahalle, Örnek Sokak No:1 İstanbul',
      tax_number: '1234567890',
      tax_office: 'Kadıköy Vergi Dairesi',
    },
    company: {
      name: 'Şirketim Ltd. Şti.',
      address: 'İş Merkezi, Kat 5 İstanbul',
      phone: '+90 212 123 45 67',
      email: 'info@sirketim.com',
      tax_number: '0987654321',
      website: 'www.sirketim.com',
    },
    items: [
      {
        id: '1',
        description: 'Yazılım Geliştirme Hizmeti',
        quantity: 1,
        unit_price: 10000,
        unit: 'ay',
        tax_rate: 18,
        discount_rate: 0,
        total: 10000,
      },
      {
        id: '2',
        description: 'Teknik Destek',
        quantity: 12,
        unit_price: 500,
        unit: 'saat',
        tax_rate: 18,
        discount_rate: 10,
        total: 5400,
      },
    ],
    subtotal: 15400,
    total_discount: 600,
    total_tax: 2664,
    total_amount: 17464,
    currency: 'TRY',
    valid_until: '2024-12-31',
    payment_terms: '30 gün vadeli',
    delivery_terms: 'Teslim tarihi: 3 ay',
    warranty_terms: '1 yıl garanti',
    notes: 'Ek notlar burada yer alacak.',
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    loadTemplates();
    setPreviewData(sampleQuoteData);
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await PdfExportService.getTemplates('quote');
      setTemplates(data);
      
      // Set first template as default or create a new one
      if (data.length > 0) {
        const defaultTemplate = data.find(t => t.is_default) || data[0];
        setSelectedTemplateId(defaultTemplate.id);
        loadTemplate(defaultTemplate);
      }
    } catch (error) {
      toast.error('Şablonlar yüklenirken hata oluştu');
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (template: PdfTemplate) => {
    form.reset({
      name: template.name,
      type: template.type,
      locale: template.locale,
      schema_json: template.schema_json,
    });
  };

  const onSubmit = async (values: TemplateFormValues) => {
    try {
      setIsLoading(true);
      
      const templateData = {
        ...values,
        version: 1,
        is_default: false,
        created_by: null, // Will be set by RLS
      };

      if (selectedTemplateId) {
        // Update existing template
        await PdfExportService.saveTemplate({
          ...templateData,
          id: selectedTemplateId,
        } as any);
        toast.success('Şablon güncellendi');
      } else {
        // Create new template
        const newTemplate = await PdfExportService.saveTemplate(templateData);
        setSelectedTemplateId(newTemplate.id);
        toast.success('Şablon kaydedildi');
      }
      
      await loadTemplates();
    } catch (error) {
      toast.error('Şablon kaydedilirken hata oluştu');
      console.error('Error saving template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAsDefault = async () => {
    if (!selectedTemplateId) return;
    
    try {
      setIsLoading(true);
      await PdfExportService.setAsDefault(selectedTemplateId, 'quote');
      toast.success('Varsayılan şablon olarak ayarlandı');
      await loadTemplates();
    } catch (error) {
      toast.error('Varsayılan şablon ayarlanırken hata oluştu');
      console.error('Error setting default:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!previewData) return;
    
    try {
      await PdfExportService.downloadPdf(previewData, {
        templateId: selectedTemplateId,
        filename: 'ornek-teklif.pdf',
      });
      toast.success('PDF indirildi');
    } catch (error) {
      toast.error('PDF indirilemedi');
      console.error('Error downloading PDF:', error);
    }
  };

  const uploadToStorage = async () => {
    if (!previewData) return;
    
    try {
      const result = await PdfExportService.uploadPdfToStorage(previewData, {
        templateId: selectedTemplateId,
        filename: 'ornek-teklif.pdf',
      });
      toast.success('PDF Storage\'a yüklendi');
      console.log('Uploaded to:', result.url);
    } catch (error) {
      toast.error('PDF yüklenemedi');
      console.error('Error uploading PDF:', error);
    }
  };

  const watchedSchema = form.watch('schema_json');

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PDF Şablon Editörü</h1>
            <p className="text-muted-foreground">Teklif PDF şablonlarını düzenleyin</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Şablon seçin" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} {template.is_default && '(Varsayılan)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={setAsDefault} disabled={!selectedTemplateId || isLoading}>
              Varsayılan Yap
            </Button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Settings Panel */}
        <ResizablePanel defaultSize={35} minSize={30}>
          <div className="h-full border-r">
            <div className="border-b p-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Şablon Ayarları
              </h2>
            </div>
            
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Temel Bilgiler</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Şablon Adı</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="schema_json.page.size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sayfa Boyutu</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A4">A4</SelectItem>
                                  <SelectItem value="A3">A3</SelectItem>
                                  <SelectItem value="Letter">Letter</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Advanced Settings */}
                    <Accordion type="single" collapsible defaultValue="header">
                      {/* Header Settings */}
                      <AccordionItem value="header">
                        <AccordionTrigger>Başlık Ayarları</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="schema_json.header.title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Başlık</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="schema_json.header.showLogo"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Logo Göster</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="schema_json.header.showValidity"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Geçerlilik Tarihi Göster</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Customer Block Settings */}
                      <AccordionItem value="customer">
                        <AccordionTrigger>Müşteri Bilgileri</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="schema_json.customerBlock.show"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Müşteri Bilgilerini Göster</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Totals Settings */}
                      <AccordionItem value="totals">
                        <AccordionTrigger>Toplam Ayarları</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="schema_json.totals.showGross"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Ara Toplam</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="schema_json.totals.showDiscount"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>İndirim</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="schema_json.totals.showTax"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>KDV</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="schema_json.totals.showNet"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <FormLabel>Genel Toplam</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Notes Settings */}
                      <AccordionItem value="notes">
                        <AccordionTrigger>Not Ayarları</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="schema_json.notes.intro"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Giriş Notu</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="schema_json.notes.footer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Alt Bilgi</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button type="submit" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </Button>
                      
                      <Button type="button" variant="outline" onClick={downloadPdf}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF İndir
                      </Button>
                      
                      <Button type="button" variant="outline" onClick={uploadToStorage}>
                        <Upload className="h-4 w-4 mr-2" />
                        Storage'a Yükle
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={65}>
          <div className="h-full">
            <div className="border-b p-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Canlı Önizleme
              </h2>
            </div>
            
            <div className="h-[calc(100vh-8rem)]">
              {previewData && (
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                  <PdfRenderer data={previewData} schema={watchedSchema} />
                </PDFViewer>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PdfTemplateEditor;
