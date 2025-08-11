import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Edit, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TemplateService } from '@/services/pdf/templateService';
import { ExportService } from '@/services/pdf/exportService';
import { useActiveProject } from '@/hooks/useActiveProject';
import type { PdfTemplate } from '@/lib/pdf/types';

export const TemplateManagement = () => {
  const navigate = useNavigate();
  const { activeProject, hasWriteAccess } = useActiveProject();
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeProject) {
      loadTemplates();
    }
  }, [activeProject]);

  const loadTemplates = async () => {
    if (!activeProject) return;
    
    try {
      setIsLoading(true);
      const data = await TemplateService.getTemplates(activeProject.id);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Şablonlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasWriteAccess) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    try {
      await TemplateService.deleteTemplate(id);
      toast.success('Şablon silindi');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Şablon silinemedi');
    }
  };

  const handlePreview = async (template: PdfTemplate) => {
    try {
      toast.info('PDF önizlemesi oluşturuluyor...');
      await ExportService.previewPdf(
        template.template_json,
        template.field_mapping_json
      );
    } catch (error) {
      console.error('Error previewing template:', error);
      toast.error('Önizleme oluşturulamadı');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!activeProject) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Proje Seçilmedi</h3>
        <p className="text-muted-foreground">Şablonları görüntülemek için bir proje seçin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">PDF Şablonları</h3>
          <p className="text-sm text-muted-foreground">
            PDF şablonlarını oluşturun ve düzenleyin
          </p>
        </div>
        {hasWriteAccess && (
          <Button 
            onClick={() => navigate('/templates/new')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Yeni Şablon
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Şablon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Şablon bulunamadı' : 'Henüz şablon yok'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Arama kriterlerinize uygun şablon bulunamadı.'
                : 'İlk PDF şablonunuzu oluşturarak başlayın.'
              }
            </p>
            {hasWriteAccess && !searchTerm && (
              <Button onClick={() => navigate('/templates/new')}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Şablonu Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1 text-sm">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Oluşturulma: {new Date(template.created_at).toLocaleDateString('tr-TR')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Önizle
                    </Button>
                    {hasWriteAccess && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/templates/${template.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};