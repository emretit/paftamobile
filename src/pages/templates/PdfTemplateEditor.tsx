import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Download, Save, Eye, EyeOff, Plus, ArrowLeft } from 'lucide-react';
import { TemplateSchema, PdfTemplate, QuoteData, CustomTextField } from '@/types/pdf-template';
import PdfRenderer from '@/components/pdf/PdfRenderer';
import { PdfExportService } from '@/services/pdf/pdfExportService';
import { LogoUploadField } from '@/components/templates/LogoUploadField';
import { CustomTextFields } from '@/components/templates/CustomTextFields';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

interface PdfTemplateEditorProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (value: boolean) => void;
}

const PdfTemplateEditor: React.FC<PdfTemplateEditorProps> = ({ 
  isCollapsed = false, 
  setIsCollapsed = () => {} 
}) => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate | null>(null);
  const [previewData, setPreviewData] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

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
        titleFontSize: z.number().min(8).max(32),
        showLogo: z.boolean(),
        logoUrl: z.string().optional(),
        logoPosition: z.enum(['left', 'center', 'right']),
        logoSize: z.number().min(20).max(200),
        showValidity: z.boolean(),
        showCompanyInfo: z.boolean(),
        companyName: z.string(),
        companyAddress: z.string(),
        companyPhone: z.string(),
        companyEmail: z.string(),
        companyWebsite: z.string(),
        companyTaxNumber: z.string(),
        companyInfoFontSize: z.number().min(8).max(32),
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
        introFontSize: z.number().min(8).max(32),
        footer: z.string(),
        footerFontSize: z.number().min(8).max(32),
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
        titleFontSize: 16,
        showLogo: true,
        logoUrl: undefined,
        logoPosition: 'left',
        logoSize: 80,
        showValidity: true,
        showCompanyInfo: true,
        companyName: 'NGS TEKNOLOJİ',
        companyAddress: 'İstanbul, Türkiye',
        companyPhone: '+90 212 555 0123',
        companyEmail: 'info@ngsteknoloji.com',
        companyWebsite: 'www.ngsteknoloji.com',
        companyTaxNumber: '1234567890',
        companyInfoFontSize: 10,
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
        introFontSize: 12,
        footer: 'İyi çalışmalar dileriz.',
        footerFontSize: 12,
        customFields: [],
      },
    },
  });

  useEffect(() => {
    loadTemplates();
    loadSampleData();
  }, []);

  useEffect(() => {
    if (templateId === 'new') {
      setIsNewTemplate(true);
      setSelectedTemplate(null);
      setTemplateName('Yeni Şablon');
      // Form'u varsayılan değerlerle doldur
      form.reset();
    } else if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setIsNewTemplate(false);
        setTemplateName(template.name);
        
        // Ensure all required fields exist with defaults
        const schemaWithDefaults = {
          ...template.schema_json,
          header: {
            ...template.schema_json.header,
            logoPosition: template.schema_json.header.logoPosition || 'left',
            logoSize: template.schema_json.header.logoSize || 80,
            titleFontSize: template.schema_json.header.titleFontSize || 16,
            showCompanyInfo: template.schema_json.header.showCompanyInfo ?? true,
            companyName: template.schema_json.header.companyName || 'NGS TEKNOLOJİ',
            companyAddress: template.schema_json.header.companyAddress || 'İstanbul, Türkiye',
            companyPhone: template.schema_json.header.companyPhone || '+90 212 555 0123',
            companyEmail: template.schema_json.header.companyEmail || 'info@ngsteknoloji.com',
            companyWebsite: template.schema_json.header.companyWebsite || 'www.ngsteknoloji.com',
            companyTaxNumber: template.schema_json.header.companyTaxNumber || '1234567890',
            companyInfoFontSize: template.schema_json.header.companyInfoFontSize || 10,
          },
          notes: {
            ...template.schema_json.notes,
            introFontSize: template.schema_json.notes.introFontSize || 12,
            footerFontSize: template.schema_json.notes.footerFontSize || 12,
          }
        };
        
        form.reset(schemaWithDefaults);
      } else {
        toast.error('Şablon bulunamadı');
        navigate('/settings');
      }
    }
  }, [templateId, templates, form, navigate]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const templates = await PdfExportService.getTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Şablonlar yüklenirken hata oluştu');
    } finally {
      setIsLoadingTemplates(false);
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
    setIsLoading(true);
    try {
      // Get current form values to ensure logo URL is included
      const currentFormData = form.getValues();
      const currentLogoUrl = currentFormData.header?.logoUrl;
      
      // Merge current form data with submitted data to ensure logo URL is preserved
      const mergedData = {
        ...data,
        header: {
          ...data.header,
          logoUrl: currentLogoUrl || data.header?.logoUrl
        }
      };

      if (isNewTemplate) {
        // Create new template
        const newTemplate: Omit<PdfTemplate, 'id' | 'created_at' | 'updated_at'> = {
          name: templateName || 'Yeni Şablon',
          type: 'quote',
          locale: 'tr',
          schema_json: mergedData,
          version: 1,
          is_default: false,
          created_by: null, // Will be set by Supabase
        };
        
        const savedTemplate = await PdfExportService.saveTemplate(newTemplate);
        toast.success('Şablon başarıyla oluşturuldu');
        
        // Navigate to edit mode
        navigate(`/pdf-templates/edit/${savedTemplate.id}`);
      } else if (selectedTemplate) {
        // Update existing template
        const updatedTemplate: Omit<PdfTemplate, 'id' | 'created_at' | 'updated_at'> = {
          name: templateName || selectedTemplate.name,
          type: selectedTemplate.type,
          locale: selectedTemplate.locale,
          schema_json: mergedData,
          version: selectedTemplate.version + 1,
          is_default: selectedTemplate.is_default,
          created_by: selectedTemplate.created_by,
        };
        
        // Pass the template ID for update
        await PdfExportService.saveTemplate(updatedTemplate, selectedTemplate.id);
        toast.success('Şablon başarıyla kaydedildi');
        
        // Update the selected template with the new schema to prevent reload issues
        setSelectedTemplate(prev => prev ? { 
          ...prev, 
          name: templateName || prev.name,
          schema_json: mergedData, 
          version: prev.version + 1 
        } : null);
        
        // Reload templates to refresh the list, but don't reset the form
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Şablon kaydedilirken hata oluştu');
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




  const watchedValues = form.watch();

  return (
    <div className="min-h-screen bg-background">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNewTemplate ? 'Yeni PDF Şablonu' : 'PDF Şablon Editörü'}
              </h1>
              <p className="text-muted-foreground">
                {isNewTemplate ? 'Yeni bir PDF şablonu oluşturun' : `${selectedTemplate?.name || 'Şablon'} düzenleniyor`}
              </p>
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
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                {/* Template Name */}
                <div className="bg-card/50 rounded-lg p-4 border border-border/20 backdrop-blur-sm">
                  <Label htmlFor="template-name">Şablon Adı</Label>
                  <Input
                    id="template-name"
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Şablon adını girin"
                    className="mt-2"
                  />
                </div>

                {/* Header Settings */}
                <Accordion type="single" collapsible defaultValue="header">
                  <AccordionItem value="header">
                    <AccordionTrigger>Başlık Ayarları</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Başlık Metni</Label>
                          <Input {...form.register('header.title')} />
                        </div>
                        <div>
                          <Label>Başlık Font Boyutu</Label>
                          <Input
                            type="number"
                            {...form.register('header.titleFontSize', { valueAsNumber: true })}
                            min="8"
                            max="32"
                            placeholder="16"
                          />
                        </div>
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
                        <div className="space-y-4">
                          <LogoUploadField
                            logoUrl={watchedValues.header?.logoUrl}
                            onLogoChange={(url) => form.setValue('header.logoUrl', url || undefined)}
                          />
                          
                          {/* Logo Position and Size */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Logo Pozisyonu</Label>
                              <Select
                                value={watchedValues.header?.logoPosition || 'left'}
                                onValueChange={(value) => form.setValue('header.logoPosition', value as 'left' | 'center' | 'right')}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pozisyon seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Sol</SelectItem>
                                  <SelectItem value="center">Orta</SelectItem>
                                  <SelectItem value="right">Sağ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Logo Boyutu</Label>
                              <Input
                                type="number"
                                {...form.register('header.logoSize', { valueAsNumber: true })}
                                min="20"
                                max="200"
                                placeholder="80"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-validity"
                          checked={watchedValues.header?.showValidity}
                          onCheckedChange={(checked) => form.setValue('header.showValidity', checked)}
                        />
                        <Label htmlFor="show-validity">Geçerlilik Tarihi Göster</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-company-info"
                          checked={watchedValues.header?.showCompanyInfo}
                          onCheckedChange={(checked) => form.setValue('header.showCompanyInfo', checked)}
                        />
                        <Label htmlFor="show-company-info">Şirket Bilgilerini Göster</Label>
                      </div>
                      
                      {watchedValues.header?.showCompanyInfo && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Şirket Adı</Label>
                              <Input {...form.register('header.companyName')} placeholder="NGS TEKNOLOJİ" />
                            </div>
                            <div>
                              <Label>Font Boyutu</Label>
                              <Input
                                type="number"
                                {...form.register('header.companyInfoFontSize', { valueAsNumber: true })}
                                min="8"
                                max="32"
                                placeholder="10"
                                className="w-20"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Şirket Adresi</Label>
                            <Input {...form.register('header.companyAddress')} placeholder="İstanbul, Türkiye" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Telefon</Label>
                              <Input {...form.register('header.companyPhone')} placeholder="+90 212 555 0123" />
                            </div>
                            <div>
                              <Label>E-posta</Label>
                              <Input {...form.register('header.companyEmail')} placeholder="info@ngsteknoloji.com" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Website</Label>
                              <Input {...form.register('header.companyWebsite')} placeholder="www.ngsteknoloji.com" />
                            </div>
                            <div>
                              <Label>Vergi No</Label>
                              <Input {...form.register('header.companyTaxNumber')} placeholder="1234567890" />
                            </div>
                          </div>
                        </div>
                      )}
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
                      <div className="space-y-2">
                        <Label>Giriş Notu</Label>
                        <Textarea {...form.register('notes.intro')} rows={3} />
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Font Boyutu:</Label>
                          <Input
                            type="number"
                            {...form.register('notes.introFontSize', { valueAsNumber: true })}
                            min="8"
                            max="32"
                            placeholder="12"
                            className="w-20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Alt Bilgi</Label>
                        <Textarea {...form.register('notes.footer')} rows={3} />
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Font Boyutu:</Label>
                          <Input
                            type="number"
                            {...form.register('notes.footerFontSize', { valueAsNumber: true })}
                            min="8"
                            max="32"
                            placeholder="12"
                            className="w-20"
                          />
                        </div>
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
                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Çık
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
      </main>
    </div>
  );
};

export default PdfTemplateEditor;