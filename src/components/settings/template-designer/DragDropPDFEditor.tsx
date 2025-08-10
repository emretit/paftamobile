import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building, User, FileText, ClipboardList, DollarSign, Settings, 
  Eye, Save, Type, Image, QrCode, Table2
} from 'lucide-react';
import { toast } from 'sonner';

interface DragDropPDFEditorProps {
  initialTemplate?: any | null;
  onSave: (template: any) => void;
  onPreview?: (template: any) => void;
}

interface FieldTemplate {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'image' | 'table' | 'qrcode';
  category: string;
  icon: React.ComponentType<any>;
  defaultConfig: any;
}

const FIELD_TEMPLATES: FieldTemplate[] = [
  // Şirket Bilgileri
  {
    id: 'companyLogo',
    name: 'companyLogo',
    label: 'Şirket Logosu',
    type: 'image',
    category: 'company',
    icon: Image,
    defaultConfig: { width: 30, height: 20 }
  },
  {
    id: 'companyName',
    name: 'companyName',
    label: 'Şirket Adı',
    type: 'text',
    category: 'company',
    icon: Type,
    defaultConfig: { fontSize: 16, fontColor: '#000000' }
  },
  {
    id: 'companyAddress',
    name: 'companyAddress',
    label: 'Şirket Adresi',
    type: 'text',
    category: 'company',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'companyContact',
    name: 'companyContact',
    label: 'İletişim Bilgileri',
    type: 'text',
    category: 'company',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },

  // Müşteri Bilgileri
  {
    id: 'customerName',
    name: 'customerName',
    label: 'Müşteri Adı',
    type: 'text',
    category: 'customer',
    icon: Type,
    defaultConfig: { fontSize: 14, fontColor: '#000000' }
  },
  {
    id: 'customerAddress',
    name: 'customerAddress',
    label: 'Müşteri Adresi',
    type: 'text',
    category: 'customer',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'customerTaxNo',
    name: 'customerTaxNo',
    label: 'Vergi No',
    type: 'text',
    category: 'customer',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },

  // Teklif Bilgileri
  {
    id: 'proposalTitle',
    name: 'proposalTitle',
    label: 'Teklif Başlığı',
    type: 'text',
    category: 'proposal',
    icon: Type,
    defaultConfig: { fontSize: 18, fontColor: '#000000' }
  },
  {
    id: 'proposalNumber',
    name: 'proposalNumber',
    label: 'Teklif No',
    type: 'text',
    category: 'proposal',
    icon: Type,
    defaultConfig: { fontSize: 12, fontColor: '#000000' }
  },
  {
    id: 'proposalDescription',
    name: 'proposalDescription',
    label: 'Açıklama',
    type: 'text',
    category: 'proposal',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'createdDate',
    name: 'createdDate',
    label: 'Oluşturma Tarihi',
    type: 'text',
    category: 'proposal',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'validUntil',
    name: 'validUntil',
    label: 'Geçerlilik Tarihi',
    type: 'text',
    category: 'proposal',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'employeeName',
    name: 'employeeName',
    label: 'Satış Temsilcisi',
    type: 'text',
    category: 'proposal',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },

  // Ürün/Hizmet
  {
    id: 'proposalItemsTable',
    name: 'proposalItemsTable',
    label: 'Ürün/Hizmet Tablosu',
    type: 'table',
    category: 'items',
    icon: Table2,
    defaultConfig: {
      width: 170,
      height: 60,
      showHead: true,
      head: ["Ürün/Hizmet", "Miktar", "Birim", "Birim Fiyat", "Toplam"],
      headWidthPercentages: [40, 15, 15, 15, 15],
      tableStyles: { borderWidth: 0.5, borderColor: '#000000' },
      headStyles: { fontSize: 10, fontColor: '#ffffff', backgroundColor: '#2980ba' },
      bodyStyles: { fontSize: 9, fontColor: '#000000' }
    }
  },

  // Mali Bilgiler
  {
    id: 'subTotal',
    name: 'subTotal',
    label: 'Ara Toplam',
    type: 'text',
    category: 'financial',
    icon: Type,
    defaultConfig: { fontSize: 12, fontColor: '#000000' }
  },
  {
    id: 'discounts',
    name: 'discounts',
    label: 'İndirim',
    type: 'text',
    category: 'financial',
    icon: Type,
    defaultConfig: { fontSize: 12, fontColor: '#000000' }
  },
  {
    id: 'additionalCharges',
    name: 'additionalCharges',
    label: 'Ek Masraflar',
    type: 'text',
    category: 'financial',
    icon: Type,
    defaultConfig: { fontSize: 12, fontColor: '#000000' }
  },
  {
    id: 'netTotal',
    name: 'netTotal',
    label: 'Net Toplam',
    type: 'text',
    category: 'financial',
    icon: Type,
    defaultConfig: { fontSize: 14, fontColor: '#000000' }
  },
  {
    id: 'totalAmount',
    name: 'totalAmount',
    label: 'Genel Toplam',
    type: 'text',
    category: 'financial',
    icon: Type,
    defaultConfig: { fontSize: 14, fontColor: '#000000' }
  },

  // Şartlar
  {
    id: 'paymentTerms',
    name: 'paymentTerms',
    label: 'Ödeme Koşulları',
    type: 'text',
    category: 'terms',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'deliveryTerms',
    name: 'deliveryTerms',
    label: 'Teslimat Koşulları',
    type: 'text',
    category: 'terms',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'warrantyTerms',
    name: 'warrantyTerms',
    label: 'Garanti Koşulları',
    type: 'text',
    category: 'terms',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },
  {
    id: 'termsText',
    name: 'termsText',
    label: 'Genel Şartlar',
    type: 'text',
    category: 'terms',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666', height: 40 }
  },
  {
    id: 'notes',
    name: 'notes',
    label: 'Notlar',
    type: 'text',
    category: 'terms',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#666666' }
  },

  // Ek Özellikler
  {
    id: 'proposalQRCode',
    name: 'proposalQRCode',
    label: 'QR Kod',
    type: 'qrcode',
    category: 'extra',
    icon: QrCode,
    defaultConfig: { width: 30, height: 30, backgroundColor: '#ffffff', color: '#000000' }
  },
  {
    id: 'proposalSummary',
    name: 'proposalSummary',
    label: 'Özet Bilgi',
    type: 'text',
    category: 'extra',
    icon: Type,
    defaultConfig: { fontSize: 10, fontColor: '#333333' }
  }
];

const CATEGORIES = {
  company: { label: 'Şirket', icon: Building, color: 'bg-blue-500' },
  customer: { label: 'Müşteri', icon: User, color: 'bg-green-500' },
  proposal: { label: 'Teklif', icon: FileText, color: 'bg-purple-500' },
  items: { label: 'Ürün/Hizmet', icon: ClipboardList, color: 'bg-orange-500' },
  financial: { label: 'Mali', icon: DollarSign, color: 'bg-yellow-500' },
  terms: { label: 'Şartlar', icon: Settings, color: 'bg-gray-500' },
  extra: { label: 'Ek', icon: FileText, color: 'bg-indigo-500' }
};

export const DragDropPDFEditor: React.FC<DragDropPDFEditorProps> = ({
  initialTemplate,
  onSave,
  onPreview
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [designer, setDesigner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateName, setTemplateName] = useState('Yeni PDF Şablonu');

  useEffect(() => {
    const initializeDesigner = async () => {
      try {
        // Delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { Designer } = await import('@pdfme/ui');
        const { text, image, barcodes, table } = await import('@pdfme/schemas');
        
        if (designerRef.current && !designer) {
          const defaultTemplate = initialTemplate || {
            basePdf: { width: 210, height: 297, padding: [20, 20, 20, 20] },
            schemas: [{}]
          };

          console.log('Creating PDFme Designer with template:', defaultTemplate);

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: defaultTemplate,
            plugins: { text, image, qrcode: barcodes.qrcode, table },
            options: {
              theme: {
                token: {
                  colorPrimary: '#dc2626'
                }
              },
              // PDFme'nin kendi side panel'ini gizle, bizim sol paneli kullan
              sidebar: {
                hideSchemaPanel: true
              }
            }
          });

          setDesigner(designerInstance);
          setIsLoading(false);
          console.log('PDFme Designer initialized successfully');
        }
      } catch (error) {
        console.error('PDFMe initialization error:', error);
        toast.error('PDF tasarımcısı yüklenirken hata oluştu: ' + error.message);
        setIsLoading(false);
      }
    };

    if (designerRef.current) {
      initializeDesigner();
    }

    return () => {
      if (designer) {
        try {
          designer.destroy();
        } catch (error) {
          console.error('Designer destroy error:', error);
        }
      }
    };
  }, [initialTemplate, designer]);

  const handleDragStart = (e: React.DragEvent, fieldTemplate: FieldTemplate) => {
    // PDFme'nin beklediği format
    const dragData = {
      type: fieldTemplate.type,
      key: fieldTemplate.name,
      ...fieldTemplate.defaultConfig
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', fieldTemplate.name);
    
    // Visual feedback için
    e.dataTransfer.effectAllowed = 'copy';
  };

  const addFieldToDesigner = (fieldTemplate: FieldTemplate, x: number = 20, y: number = 30) => {
    if (!designer) return;

    try {
      const currentTemplate = designer.getTemplate();
      
      // Yeni field objesi
      const newField = {
        [fieldTemplate.name]: {
          type: fieldTemplate.type,
          position: { x, y },
          width: fieldTemplate.defaultConfig.width || 60,
          height: fieldTemplate.defaultConfig.height || 8,
          ...fieldTemplate.defaultConfig
        }
      };

      // Mevcut schema'ya field ekle
      const updatedSchemas = currentTemplate.schemas.map((schema: any, index: number) => {
        if (index === 0) {
          return { ...schema, ...newField };
        }
        return schema;
      });

      // Template'ı güncelle
      designer.setTemplate({
        ...currentTemplate,
        schemas: updatedSchemas
      });

      toast.success(`${fieldTemplate.label} eklendi`);
    } catch (error) {
      console.error('Field add error:', error);
      toast.error(`${fieldTemplate.label} eklenirken hata oluştu`);
    }
  };

  const handleSave = () => {
    if (designer) {
      try {
        const template = designer.getTemplate();
        onSave({ ...template, name: templateName });
        toast.success('Şablon kaydedildi');
      } catch (error) {
        console.error('Template save error:', error);
        toast.error('Şablon kaydedilemedi');
      }
    }
  };

  const handlePreview = () => {
    if (designer && onPreview) {
      try {
        const template = designer.getTemplate();
        onPreview(template);
      } catch (error) {
        console.error('Template preview error:', error);
        toast.error('Önizleme oluşturulamadı');
      }
    }
  };

  const getFieldsByCategory = (category: string) => {
    return FIELD_TEMPLATES.filter(field => field.category === category);
  };

  return (
    <div className="flex h-[800px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Sol Panel - Field Library */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg">PDF Alanları</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Alanları PDF'e sürükleyip bırakın
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {Object.entries(CATEGORIES).map(([categoryKey, category]) => {
              const fields = getFieldsByCategory(categoryKey);
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${category.color}`} />
                    <span className="font-medium text-sm">{category.label}</span>
                    <Badge variant="secondary" className="text-xs">{fields.length}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {fields.map((field) => {
                      const FieldIcon = field.icon;
                      
                      return (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, field)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors select-none"
                        >
                          <FieldIcon className="w-4 h-4 text-gray-600" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{field.label}</div>
                            <div className="text-xs text-gray-500">{field.type}</div>
                          </div>
                          <div className="text-xs text-blue-600 font-medium">Sürükle</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* PDF Designer Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="templateName" className="text-sm font-medium">Şablon Adı</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1 w-64"
                placeholder="Şablon adını girin..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            {onPreview && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Önizleme
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>

        <div className="flex-1 relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-sm text-muted-foreground">PDF tasarımcısı yükleniyor...</div>
              </div>
            </div>
          )}
          <div
            ref={designerRef}
            className="w-full h-full min-h-[600px]"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const dragDataStr = e.dataTransfer.getData('application/json');
                if (dragDataStr) {
                  const dragData = JSON.parse(dragDataStr);
                  
                  // Canvas içindeki relative pozisyonu hesapla
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 210; // A4 width mm
                  const y = ((e.clientY - rect.top) / rect.height) * 297; // A4 height mm
                  
                  // Field template'ı bul
                  const fieldTemplate = FIELD_TEMPLATES.find(f => f.name === dragData.key);
                  if (fieldTemplate) {
                    addFieldToDesigner(fieldTemplate, Math.max(0, x), Math.max(0, y));
                  }
                }
              } catch (error) {
                console.error('Drop handling error:', error);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DragDropPDFEditor;
