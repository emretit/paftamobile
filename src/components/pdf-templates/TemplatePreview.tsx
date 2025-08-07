import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Settings, Check } from 'lucide-react';
import { PdfTemplateComponent } from '@/utils/pdfTemplateRegistry';
import { usePdfTemplates } from '@/hooks/usePdfTemplates';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Proposal } from '@/types/proposal';
import { toast } from 'sonner';

interface TemplatePreviewProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  onDownloadWithTemplate?: (templateId: string) => void;
  proposal?: Proposal;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  onDownloadWithTemplate,
  proposal
}) => {
  const { templates } = usePdfTemplates();
  const [previewTemplate, setPreviewTemplate] = useState<PdfTemplateComponent | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (template: PdfTemplateComponent) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    onTemplateSelect(templateId);
    toast.success('Şablon seçildi');
  };

  const handleDownload = (templateId: string) => {
    if (onDownloadWithTemplate) {
      onDownloadWithTemplate(templateId);
    } else {
      toast.error('PDF indirme fonksiyonu mevcut değil');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">PDF Şablonu Seçin</h3>
        <p className="text-muted-foreground">
          Teklifleriniz için profesyonel görünüm sağlayan şablonlardan birini seçin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplateId === template.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {template.name}
                    {selectedTemplateId === template.id && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Template Preview Area */}
              <div className="aspect-[3/4] bg-gray-50 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center space-y-2">
                  <Eye className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">PDF Önizleme</p>
                  <p className="text-xs text-gray-400">{template.name}</p>
                </div>
              </div>
              
              {/* Features List */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium">Özellikler:</h4>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                  {template.features.length > 3 && (
                    <p className="text-xs text-gray-500 ml-4">
                      +{template.features.length - 3} özellik daha
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Önizle
                </Button>
                
                {selectedTemplateId === template.id ? (
                  <Button
                    size="sm"
                    onClick={() => handleDownload(template.id)}
                    className="flex-1"
                    disabled={!proposal}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    İndir
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSelectTemplate(template.id)}
                    className="flex-1"
                  >
                    Seç
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Selection Dropdown */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Hızlı Seçim:</span>
        <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Şablon seçin..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedTemplateId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(selectedTemplateId)}
            disabled={!proposal}
          >
            <Download className="h-4 w-4 mr-2" />
            Seçili Şablon ile İndir
          </Button>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} - Önizleme</DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Features */}
            <div>
              <h4 className="font-medium mb-2">Şablon Özellikleri:</h4>
              <div className="grid grid-cols-2 gap-2">
                {previewTemplate?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Preview Area */}
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center border">
              <div className="text-center space-y-2">
                <Eye className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg text-gray-600">PDF Önizleme</p>
                <p className="text-sm text-gray-500">{previewTemplate?.name}</p>
                <Badge variant="outline">{previewTemplate?.category}</Badge>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
              >
                Kapat
              </Button>
              <Button
                onClick={() => {
                  if (previewTemplate) {
                    handleSelectTemplate(previewTemplate.id);
                    setIsPreviewOpen(false);
                  }
                }}
              >
                Bu Şablonu Seç
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};