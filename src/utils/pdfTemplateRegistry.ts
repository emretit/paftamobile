import React from 'react';
import { Proposal } from '@/types/proposal';
import { CompanySettings } from '@/hooks/useCompanySettings';
import { StandardTemplate } from '@/components/pdf-templates/StandardTemplate';
import { ModernTemplate } from '@/components/pdf-templates/ModernTemplate';
import { MinimalTemplate } from '@/components/pdf-templates/MinimalTemplate';

export interface PdfTemplateComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  component: React.ComponentType<{
    proposal: Proposal;
    companySettings: CompanySettings;
  }>;
  previewImage?: string;
  features: string[];
}

export const pdfTemplateRegistry: PdfTemplateComponent[] = [
  {
    id: 'template-standard',
    name: 'Standart Teklif',
    description: 'Klasik ve profesyonel görünüm, tüm işletmeler için uygun',
    category: 'standard',
    component: StandardTemplate,
    features: [
      'Kırmızı logo alanı',
      'Yan yana müşteri/teklif bilgileri',
      'Gri başlıklı tablo',
      'Detaylı hesaplama alanı',
      'Şartlar ve koşullar bölümü'
    ]
  },
  {
    id: 'template-modern',
    name: 'Modern Tasarım',
    description: 'Mavi tonlarında modern ve şık tasarım',
    category: 'modern',
    component: ModernTemplate,
    features: [
      'Mavi gradient header',
      'Kartlı bilgi düzeni',
      'Modern tablo tasarımı',
      'Vurgulu toplam alanı',
      'Footer ile iletişim bilgileri'
    ]
  },
  {
    id: 'template-minimal',
    name: 'Minimal Teklif',
    description: 'Sade ve temiz görünüm, hızlı işlemler için ideal',
    category: 'minimal',
    component: MinimalTemplate,
    features: [
      'Siyah-beyaz minimal tasarım',
      'Temiz tipografi',
      'Çizgili ayrım elemanları',
      'İmza alanı',
      'Kompakt düzen'
    ]
  }
];

export const getPdfTemplate = (templateId: string): PdfTemplateComponent | null => {
  return pdfTemplateRegistry.find(template => template.id === templateId) || null;
};

export const getDefaultTemplate = (): PdfTemplateComponent => {
  return pdfTemplateRegistry[0]; // Standard template as default
};