import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Settings, Eye, FileText, User, Building, DollarSign, Calendar, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

interface SimplePDFTemplateEditorProps {
  initialTemplate?: any | null;
  onSave: (template: any) => void;
  onPreview?: (template: any) => void;
}

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'table' | 'image' | 'qrcode';
  label: string;
  category: string;
  required?: boolean;
  description?: string;
}

const AVAILABLE_FIELDS: TemplateField[] = [
  // Şirket Bilgileri
  { id: 'companyName', name: 'companyName', type: 'text', label: 'Şirket Adı', category: 'company' },
  { id: 'companyLogo', name: 'companyLogo', type: 'image', label: 'Şirket Logosu', category: 'company' },
  { id: 'companyAddress', name: 'companyAddress', type: 'text', label: 'Şirket Adresi', category: 'company' },
  { id: 'companyContact', name: 'companyContact', type: 'text', label: 'İletişim Bilgileri', category: 'company' },
  
  // Müşteri Bilgileri
  { id: 'customerName', name: 'customerName', type: 'text', label: 'Müşteri Adı', category: 'customer', required: true },
  { id: 'customerAddress', name: 'customerAddress', type: 'text', label: 'Müşteri Adresi', category: 'customer' },
  { id: 'customerTaxNo', name: 'customerTaxNo', type: 'text', label: 'Vergi No', category: 'customer' },
  
  // Teklif Bilgileri
  { id: 'proposalNumber', name: 'proposalNumber', type: 'text', label: 'Teklif No', category: 'proposal', required: true },
  { id: 'proposalTitle', name: 'proposalTitle', type: 'text', label: 'Teklif Başlığı', category: 'proposal', required: true },
  { id: 'proposalDescription', name: 'proposalDescription', type: 'text', label: 'Açıklama', category: 'proposal' },
  { id: 'createdDate', name: 'createdDate', type: 'text', label: 'Oluşturma Tarihi', category: 'proposal' },
  { id: 'validUntil', name: 'validUntil', type: 'text', label: 'Geçerlilik Tarihi', category: 'proposal' },
  { id: 'status', name: 'status', type: 'text', label: 'Durum', category: 'proposal' },
  { id: 'employeeName', name: 'employeeName', type: 'text', label: 'Satış Temsilcisi', category: 'proposal' },
  { id: 'currency', name: 'currency', type: 'text', label: 'Para Birimi', category: 'proposal' },
  
  // Ürün/Hizmet Listesi
  { id: 'proposalItemsTable', name: 'proposalItemsTable', type: 'table', label: 'Ürün/Hizmet Tablosu', category: 'items', required: true },
  
  // Mali Bilgiler
  { id: 'subTotal', name: 'subTotal', type: 'text', label: 'Ara Toplam', category: 'financial' },
  { id: 'discounts', name: 'discounts', type: 'text', label: 'İndirim', category: 'financial' },
  { id: 'additionalCharges', name: 'additionalCharges', type: 'text', label: 'Ek Masraflar', category: 'financial' },
  { id: 'netTotal', name: 'netTotal', type: 'text', label: 'Net Toplam', category: 'financial', required: true },
  { id: 'totalAmount', name: 'totalAmount', type: 'text', label: 'Genel Toplam', category: 'financial', required: true },
  
  // Şartlar ve Koşullar
  { id: 'paymentTerms', name: 'paymentTerms', type: 'text', label: 'Ödeme Koşulları', category: 'terms' },
  { id: 'deliveryTerms', name: 'deliveryTerms', type: 'text', label: 'Teslimat Koşulları', category: 'terms' },
  { id: 'warrantyTerms', name: 'warrantyTerms', type: 'text', label: 'Garanti Koşulları', category: 'terms' },
  { id: 'priceTerms', name: 'priceTerms', type: 'text', label: 'Fiyat Koşulları', category: 'terms' },
  { id: 'otherTerms', name: 'otherTerms', type: 'text', label: 'Diğer Koşullar', category: 'terms' },
  { id: 'termsText', name: 'termsText', type: 'text', label: 'Genel Şartlar', category: 'terms' },
  { id: 'notes', name: 'notes', type: 'text', label: 'Notlar', category: 'terms' },
  
  // Ek Özellikler
  { id: 'proposalQRCode', name: 'proposalQRCode', type: 'qrcode', label: 'QR Kod', category: 'extra' },
  { id: 'proposalSummary', name: 'proposalSummary', type: 'text', label: 'Özet Bilgi', category: 'extra' }
];

const CATEGORIES = {
  company: { label: 'Şirket Bilgileri', icon: Building, color: 'bg-blue-100 text-blue-800' },
  customer: { label: 'Müşteri Bilgileri', icon: User, color: 'bg-green-100 text-green-800' },
  proposal: { label: 'Teklif Bilgileri', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  items: { label: 'Ürün/Hizmet', icon: ClipboardList, color: 'bg-orange-100 text-orange-800' },
  financial: { label: 'Mali Bilgiler', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' },
  terms: { label: 'Şartlar', icon: Settings, color: 'bg-gray-100 text-gray-800' },
  extra: { label: 'Ek Özellikler', icon: Plus, color: 'bg-indigo-100 text-indigo-800' }
};

export const SimplePDFTemplateEditor: React.FC<SimplePDFTemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onPreview
}) => {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'Yeni Şablon');
  const [selectedFields, setSelectedFields] = useState<TemplateField[]>([]);
  const [activeTab, setActiveTab] = useState('fields');

  const handleFieldAdd = (field: TemplateField) => {
    if (selectedFields.find(f => f.id === field.id)) {
      toast.error('Bu alan zaten eklenmiş');
      return;
    }
    
    setSelectedFields([...selectedFields, field]);
    toast.success(`${field.label} eklendi`);
  };

  const handleFieldRemove = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(f => f.id !== fieldId));
    toast.success('Alan kaldırıldı');
  };

  const handleSave = () => {
    if (selectedFields.length === 0) {
      toast.error('En az bir alan seçmelisiniz');
      return;
    }

    // PDFme template format'ına çevir
    const template = {
      basePdf: { width: 210, height: 297, padding: [20, 20, 20, 20] },
      schemas: [
        selectedFields.reduce((schema, field, index) => {
          const baseConfig = {
            position: { 
              x: 20, 
              y: 30 + (index * 15) // Her alan 15mm altına
            },
            width: field.type === 'table' ? 170 : (field.type === 'qrcode' ? 30 : 100),
            height: field.type === 'table' ? 50 : (field.type === 'qrcode' ? 30 : 8),
            fontSize: field.type === 'table' ? 10 : 12,
            fontColor: '#000000'
          };

          if (field.type === 'table') {
            schema[field.name] = {
              type: 'table',
              ...baseConfig,
              content: '[["Ürün/Hizmet","Miktar","Birim","Birim Fiyat","Toplam"]]',
              showHead: true,
              head: ["Ürün/Hizmet", "Miktar", "Birim", "Birim Fiyat", "Toplam"],
              headWidthPercentages: [40, 15, 15, 15, 15],
              tableStyles: { borderWidth: 0.5, borderColor: '#000000' },
              headStyles: { fontSize: 10, fontColor: '#ffffff', backgroundColor: '#2980ba' },
              bodyStyles: { fontSize: 9, fontColor: '#000000' }
            };
          } else if (field.type === 'qrcode') {
            schema[field.name] = {
              type: 'qrcode',
              ...baseConfig,
              backgroundColor: '#ffffff',
              color: '#000000'
            };
          } else if (field.type === 'image') {
            schema[field.name] = {
              type: 'image',
              ...baseConfig,
              width: 30,
              height: 20
            };
          } else {
            schema[field.name] = {
              type: 'text',
              ...baseConfig
            };
          }

          return schema;
        }, {} as any)
      ]
    };

    onSave({ ...template, name: templateName });
  };

  const handlePreview = () => {
    if (onPreview && selectedFields.length > 0) {
      handleSave(); // Önce kaydet
      // Preview fonksiyonu parent'tan gelir
    }
  };

  const getFieldsByCategory = (category: string) => {
    return AVAILABLE_FIELDS.filter(field => field.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">PDF Şablon Oluşturucu</h3>
          <p className="text-sm text-muted-foreground">
            Teklif PDF'leriniz için kullanmak istediğiniz alanları seçin
          </p>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button variant="outline" onClick={handlePreview} disabled={selectedFields.length === 0}>
              <Eye className="h-4 w-4 mr-2" />
              Önizleme
            </Button>
          )}
          <Button onClick={handleSave} disabled={selectedFields.length === 0}>
            Kaydet
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName">Şablon Adı</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Örn: Standart Teklif Şablonu"
            />
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields">Alan Seçimi</TabsTrigger>
          <TabsTrigger value="selected">Seçilen Alanlar ({selectedFields.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          {Object.entries(CATEGORIES).map(([categoryKey, category]) => {
            const categoryFields = getFieldsByCategory(categoryKey);
            const CategoryIcon = category.icon;
            
            return (
              <Card key={categoryKey} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="h-5 w-5" />
                  <h4 className="font-medium">{category.label}</h4>
                  <Badge variant="secondary" className={category.color}>
                    {categoryFields.length} alan
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categoryFields.map((field) => {
                    const isSelected = selectedFields.find(f => f.id === field.id);
                    
                    return (
                      <Button
                        key={field.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="justify-start h-auto p-3"
                        onClick={() => handleFieldAdd(field)}
                        disabled={!!isSelected}
                      >
                        <div className="text-left">
                          <div className="font-medium text-sm">{field.label}</div>
                          {field.description && (
                            <div className="text-xs text-muted-foreground">{field.description}</div>
                          )}
                          {field.required && (
                            <Badge variant="destructive" className="text-xs mt-1">Zorunlu</Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          {selectedFields.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Henüz alan seçilmedi</h3>
              <p className="text-muted-foreground mb-4">
                "Alan Seçimi" sekmesinden PDF'inize eklemek istediğiniz alanları seçin
              </p>
              <Button variant="outline" onClick={() => setActiveTab('fields')}>
                Alan Seçimine Git
              </Button>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Seçilen Alanlar</h4>
                  <Badge variant="secondary">{selectedFields.length} alan</Badge>
                </div>
                
                <div className="space-y-2">
                  {selectedFields.map((field, index) => {
                    const category = CATEGORIES[field.category as keyof typeof CATEGORIES];
                    const CategoryIcon = category.icon;
                    
                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              #{index + 1}
                            </span>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{field.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {category.label} • {field.type}
                            </div>
                          </div>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldRemove(field.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplePDFTemplateEditor;
