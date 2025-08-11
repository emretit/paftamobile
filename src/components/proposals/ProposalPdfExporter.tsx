import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Proposal } from '@/types/proposal';
import { ProposalTemplate } from '@/types/proposal-template';
import { mapProposalToTemplateInputs, validateTemplateFields, STANDARD_FIELD_MAPPING } from '@/utils/proposalFieldMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProposalPdfExporterProps {
  proposal: Proposal;
  templates?: ProposalTemplate[]; // Gerçek uygulamada API'den gelecek
  onExportComplete?: () => void;
}

export const ProposalPdfExporter: React.FC<ProposalPdfExporterProps> = ({
  proposal,
  templates = [],
  onExportComplete
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // PDFme uyumlu örnek template'ler (gerçek uygulamada Supabase'den gelecek)
  const defaultTemplates: ProposalTemplate[] = [
    {
      id: "standard-proposal",
      name: "Standart Teklif Şablonu",
      description: "Genel amaçlı teklif şablonu - tüm temel alanları içerir",
      templateType: "standard",
      templateFeatures: ["Teklif bilgileri", "Müşteri bilgileri", "Ürün tablosu", "Toplam tutar"],
      items: [],
      // PDFme template yapısı - schemas[0] içinde field'lar name property ile tanımlanır
      template_json: {
        basePdf: "BLANK_PDF",
        schemas: [
          [
            // Teklif başlık bilgileri
            {
              name: "proposalNumber",
              type: "text",
              position: { x: 20, y: 20 },
              width: 80,
              height: 8,
              fontSize: 12,
              fontName: "NotoSerifJP-Regular"
            },
            {
              name: "proposalTitle", 
              type: "text",
              position: { x: 20, y: 35 },
              width: 200,
              height: 12,
              fontSize: 18,
              fontName: "NotoSerifJP-Regular"
            },
            {
              name: "proposalDate",
              type: "text", 
              position: { x: 20, y: 55 },
              width: 80,
              height: 8,
              fontSize: 10
            },
            
            // Şirket bilgileri (sağ üst)
            {
              name: "companyName",
              type: "text",
              position: { x: 350, y: 20 },
              width: 120,
              height: 12,
              fontSize: 14,
              fontName: "NotoSerifJP-Regular"
            },
            
            // Müşteri bilgileri
            {
              name: "customerName",
              type: "text",
              position: { x: 20, y: 85 },
              width: 150,
              height: 10,
              fontSize: 12
            },
            {
              name: "customerCompany",
              type: "text",
              position: { x: 20, y: 100 },
              width: 150,
              height: 8,
              fontSize: 10
            },
            
            // Satış temsilcisi (sağda)
            {
              name: "employeeName",
              type: "text",
              position: { x: 350, y: 85 },
              width: 120,
              height: 10,
              fontSize: 12
            },
            
            // Ürün tablosu
            {
              name: "itemsTable",
              type: "table",
              position: { x: 20, y: 130 },
              width: 450,
              height: 200
            },
            
            // Finansal bilgiler (sağ alt)
            {
              name: "totalAmount",
              type: "text",
              position: { x: 350, y: 350 },
              width: 120,
              height: 12,
              fontSize: 14,
              fontName: "NotoSerifJP-Regular"
            },
            
            // Şartlar (alt)
            {
              name: "paymentTerms",
              type: "text",
              position: { x: 20, y: 380 },
              width: 450,
              height: 8,
              fontSize: 9
            }
          ]
        ]
      }
    },
    {
      id: "detailed-proposal",
      name: "Detaylı Teklif Şablonu",
      description: "Kapsamlı teklif şablonu - tüm detayları içerir",
      templateType: "detailed",
      templateFeatures: ["Tüm standart alanlar", "Satış temsilcisi", "Şart detayları", "Notlar"],
      items: [],
      template_json: {
        schemas: [{
          // Teklif bilgileri
          proposalNumber: { type: 'text', position: { x: 20, y: 20 } },
          proposalTitle: { type: 'text', position: { x: 20, y: 40 } },
          proposalDate: { type: 'text', position: { x: 20, y: 60 } },
          proposalValidUntil: { type: 'text', position: { x: 200, y: 60 } },
          proposalStatus: { type: 'text', position: { x: 400, y: 60 } },
          
          // Şirket bilgileri
          companyName: { type: 'text', position: { x: 20, y: 80 } },
          companyAddress: { type: 'text', position: { x: 20, y: 100 } },
          companyPhone: { type: 'text', position: { x: 20, y: 120 } },
          
          // Müşteri bilgileri
          customerName: { type: 'text', position: { x: 20, y: 160 } },
          customerCompany: { type: 'text', position: { x: 20, y: 180 } },
          customerEmail: { type: 'text', position: { x: 20, y: 200 } },
          
          // Satış temsilcisi
          employeeName: { type: 'text', position: { x: 300, y: 160 } },
          employeeTitle: { type: 'text', position: { x: 300, y: 180 } },
          employeeEmail: { type: 'text', position: { x: 300, y: 200 } },
          
          // Ürün tablosu
          itemsTable: { type: 'table', position: { x: 20, y: 240 } },
          
          // Finansal bilgiler
          subtotal: { type: 'text', position: { x: 400, y: 450 } },
          taxAmount: { type: 'text', position: { x: 400, y: 470 } },
          totalAmount: { type: 'text', position: { x: 400, y: 490 } },
          
          // Şartlar
          paymentTerms: { type: 'text', position: { x: 20, y: 520 } },
          deliveryTerms: { type: 'text', position: { x: 20, y: 540 } },
          warrantyTerms: { type: 'text', position: { x: 20, y: 560 } },
          
          // Notlar
          notes: { type: 'text', position: { x: 20, y: 600 } }
        }]
      }
    }
  ];

  const availableTemplates = templates.length > 0 ? templates : defaultTemplates;

  // Template seçildiğinde validation yap
  const handleTemplateSelect = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      // Template field'larını validate et
      const validation = validateTemplateFields(template.template_json);
      setValidationResult(validation);
    }
  };

  // PDF export işlemi
  const handleExportPdf = async () => {
    if (!selectedTemplate) {
      toast.error("Lütfen bir template seçin");
      return;
    }

    setIsExporting(true);
    try {
      // Proposal verilerini template input'larına dönüştür
      const pdfInputs = mapProposalToTemplateInputs(proposal, selectedTemplate.template_json);
      
      console.log("📋 Template field mapping:", pdfInputs);
      console.log("🎯 Template schema:", selectedTemplate.template_json);
      
      // PDF oluştur ve indir
      const { generateAndDownloadPdf } = await import('@/lib/pdf-utils');
      
      await generateAndDownloadPdf(
        selectedTemplate.template_json,
        pdfInputs,
        `Teklif-${proposal.number || proposal.id}`
      );
      
      toast.success("PDF başarıyla oluşturuldu!");
      onExportComplete?.();
      
    } catch (error: any) {
      console.error("PDF export hatası:", error);
      toast.error(`PDF oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Preview mapping'i göster
  const previewMapping = () => {
    if (!selectedTemplate) return null;
    
    const mappedInputs = mapProposalToTemplateInputs(proposal, selectedTemplate.template_json);
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Template Eşleştirme Önizlemesi</h4>
        <div className="space-y-1 text-sm">
          {Object.entries(mappedInputs).slice(0, 6).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className="font-mono text-xs bg-white px-2 py-1 rounded max-w-48 truncate">
                {Array.isArray(value) ? `[${value.length} satır]` : String(value)}
              </span>
            </div>
          ))}
          {Object.keys(mappedInputs).length > 6 && (
            <div className="text-gray-500 text-xs">
              +{Object.keys(mappedInputs).length - 6} alan daha...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Seçici */}
        <div>
          <label className="text-sm font-medium mb-2 block">Template Seç</label>
          <Select value={selectedTemplate?.id || ""} onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="PDF template'i seçin..." />
            </SelectTrigger>
            <SelectContent>
              {availableTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Bilgisi */}
        {selectedTemplate && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
                <p className="text-sm text-blue-700 mt-1">{selectedTemplate.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTemplate.templateFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Validation Status */}
              {validationResult && (
                <div className="flex items-center gap-1">
                  {validationResult.valid ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Uyumlu</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">Eksik alanlar</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Validation Warnings */}
            {validationResult && !validationResult.valid && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                <div className="font-medium text-amber-800">Eksik alanlar:</div>
                <ul className="list-disc list-inside text-amber-700 mt-1">
                  {validationResult.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Mapping Preview */}
        {selectedTemplate && previewMapping()}

        {/* Export Button */}
        <div className="flex gap-2">
          <Button 
            onClick={handleExportPdf}
            disabled={!selectedTemplate || isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <>PDF Oluşturuluyor...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                PDF Oluştur ve İndir
              </>
            )}
          </Button>
        </div>

        {/* Field Mapping Info */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <details>
            <summary className="cursor-pointer font-medium">Teknik Detaylar</summary>
            <div className="mt-2 space-y-1">
              <div>• Toplam {Object.keys(STANDARD_FIELD_MAPPING).length} standart alan tanımlı</div>
              <div>• Template {selectedTemplate ? Object.keys(selectedTemplate.template_json?.schemas?.[0] || {}).length : 0} alan içeriyor</div>
              <div>• Teklif #{proposal.number} - {proposal.title}</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalPdfExporter;
