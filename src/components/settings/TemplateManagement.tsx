import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const TemplateManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Şablon Yönetimi</h2>
        <Button onClick={() => navigate('/settings/templates/pdfme')}>PDFMe Şablon Editörü</Button>
      </div>

      <Card className="p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Artık teklif PDF şablonlarını PDFMe editörüyle düzenleyebilirsiniz. Mevcut şablon listesi kaldırıldı.
        </p>
        <div>
          <Button variant="outline" onClick={() => navigate('/settings/templates/pdfme')}>
            Editöre Git
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TemplateManagement;
