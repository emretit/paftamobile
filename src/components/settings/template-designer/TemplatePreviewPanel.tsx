import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Download, 
  Printer, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  Maximize,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalTemplate } from '@/types/proposal-template';

interface TemplatePreviewPanelProps {
  template: ProposalTemplate;
  sampleData?: any;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export const TemplatePreviewPanel: React.FC<TemplatePreviewPanelProps> = ({
  template,
  sampleData,
  isFullscreen = false,
  onToggleFullscreen,
  onDownloadPDF,
  onPrint,
  onShare
}) => {
  const [zoom, setZoom] = useState(100);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sample data for preview
  const defaultSampleData = {
    proposal: {
      number: 'TKL-2024-001',
      date: new Date().toLocaleDateString('tr-TR'),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      status: 'Taslak',
      currency: 'TRY'
    },
    customer: {
      company: 'Örnek Şirket A.Ş.',
      contact: 'Ahmet Yılmaz',
      email: 'ahmet@ornek.com',
      phone: '+90 212 123 45 67',
      address: 'Örnek Mah. Test Sok. No:1 İstanbul'
    },
    company: {
      name: template.designSettings?.branding?.companyName || 'Şirketiniz',
      address: 'Merkez Mah. İş Sok. No:10 Ankara',
      phone: '+90 312 987 65 43',
      email: 'info@sirketiniz.com',
      website: template.designSettings?.branding?.website || 'www.sirketiniz.com',
      taxNumber: '1234567890'
    },
    items: [
      {
        id: '1',
        description: 'Web Sitesi Tasarımı',
        quantity: 1,
        unit: 'Adet',
        unitPrice: 5000,
        discount: 0,
        tax: 18,
        total: 5900
      },
      {
        id: '2',
        description: 'SEO Optimizasyonu',
        quantity: 1,
        unit: 'Paket',
        unitPrice: 2000,
        discount: 10,
        tax: 18,
        total: 2124
      },
      {
        id: '3',
        description: 'Bakım ve Destek (12 Ay)',
        quantity: 12,
        unit: 'Ay',
        unitPrice: 300,
        discount: 0,
        tax: 18,
        total: 4248
      }
    ],
    totals: {
      subtotal: 7700,
      discountTotal: 200,
      taxTotal: 1372,
      grandTotal: 12272
    },
    terms: [
      {
        category: 'payment',
        title: 'Ödeme Şartları',
        content: '%50 avans, %50 teslimde ödenecektir.'
      },
      {
        category: 'delivery',
        title: 'Teslimat',
        content: 'Proje 4-6 hafta içerisinde teslim edilecektir.'
      },
      {
        category: 'warranty',
        title: 'Garanti',
        content: '1 yıl ücretsiz teknik destek sağlanacaktır.'
      }
    ]
  };

  const previewData = { ...defaultSampleData, ...sampleData };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
  const handleResetZoom = () => setZoom(100);

  const getViewportStyles = () => {
    switch (viewport) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      default:
        return { width: '100%' };
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Preview Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground">Canlı Önizleme</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Controls */}
            <div className="flex border rounded-md">
              <Button
                variant={viewport === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('desktop')}
                className="rounded-r-none px-3"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={viewport === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('tablet')}
                className="rounded-none px-3"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={viewport === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('mobile')}
                className="rounded-l-none px-3"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Action Controls */}
            <div className="flex items-center gap-1">
              {onDownloadPDF && (
                <Button variant="outline" size="sm" onClick={onDownloadPDF}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Printer className="w-4 h-4" />
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              {onToggleFullscreen && (
                <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6">
        <div 
          className="mx-auto bg-white shadow-lg transition-all duration-200"
          style={{
            ...getViewportStyles(),
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          <TemplateRenderer template={template} data={previewData} />
        </div>
      </div>

      {/* Preview Footer - Template Info */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Şablon Türü: <Badge variant="outline">{template.templateType}</Badge></span>
            <span>Son Güncelleme: {new Date(template.updated_at || '').toLocaleDateString('tr-TR')}</span>
            {template.estimatedTime && (
              <span>Tahmini Süre: {template.estimatedTime}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {template.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TemplateRendererProps {
  template: ProposalTemplate;
  data: any;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, data }) => {
  const designSettings = template.designSettings;

  if (!designSettings) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Şablon tasarım ayarları bulunamadı</p>
      </div>
    );
  }

  const {
    colors = {},
    fonts = {},
    header = {},
    footer = {},
    branding = {},
    sections = []
  } = designSettings;

  return (
    <div 
      className="min-h-[842px] w-full" // A4 aspect ratio
      style={{ 
        backgroundColor: colors.background || '#ffffff',
        color: colors.text || '#1f2937',
        fontFamily: fonts.primary || 'Inter',
        fontSize: `${fonts.sizes?.body || 14}px`
      }}
    >
      {/* Header Section */}
      {header.enabled && (
        <div 
          className="p-6 border-b"
          style={{ 
            backgroundColor: header.backgroundColor || colors.background,
            color: header.textColor || colors.text,
            height: `${header.height || 80}px`
          }}
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo Area */}
            <div className={cn(
              "flex items-center",
              header.logoPosition === 'center' && "mx-auto",
              header.logoPosition === 'right' && "ml-auto"
            )}>
              {branding.logo ? (
                <img 
                  src={branding.logo} 
                  alt="Logo" 
                  className={cn(
                    "object-contain",
                    header.logoSize === 'small' && "h-8",
                    header.logoSize === 'medium' && "h-12",
                    header.logoSize === 'large' && "h-16"
                  )}
                />
              ) : (
                <div 
                  className={cn(
                    "flex items-center justify-center rounded text-white font-bold",
                    header.logoSize === 'small' && "h-8 w-20 text-sm",
                    header.logoSize === 'medium' && "h-12 w-32 text-lg",
                    header.logoSize === 'large' && "h-16 w-40 text-xl"
                  )}
                  style={{ backgroundColor: colors.primary || '#ef4444' }}
                >
                  LOGO
                </div>
              )}
            </div>

            {/* Company Info */}
            {header.showCompanyInfo && (
              <div className="text-right text-sm">
                <div className="font-semibold" style={{ fontSize: `${fonts.sizes?.heading || 18}px` }}>
                  {data.company.name}
                </div>
                <div className="text-xs mt-1 space-y-1">
                  <div>{data.company.address}</div>
                  <div>{data.company.phone} • {data.company.email}</div>
                  <div>{data.company.website}</div>
                  <div>Vergi No: {data.company.taxNumber}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="text-center py-6">
        <h1 
          className="font-bold"
          style={{ 
            fontSize: `${fonts.sizes?.title || 32}px`,
            color: colors.primary || '#2563eb'
          }}
        >
          TEKLİF
        </h1>
      </div>

      {/* Content Sections */}
      <div className="px-6 space-y-6">
        {sections.map(section => (
          <div key={section.id}>
            {section.type === 'customer-info' && (
              <CustomerInfoSection data={data} colors={colors} fonts={fonts} />
            )}
            {section.type === 'items-table' && (
              <ItemsTableSection data={data} colors={colors} fonts={fonts} designSettings={designSettings} />
            )}
            {section.type === 'totals' && (
              <TotalsSection data={data} colors={colors} fonts={fonts} />
            )}
            {section.type === 'terms' && (
              <TermsSection data={data} colors={colors} fonts={fonts} />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer.enabled && (
        <div 
          className="mt-8 p-4 border-t text-center text-sm"
          style={{ 
            backgroundColor: footer.backgroundColor || colors.background,
            color: footer.textColor || colors.text
          }}
        >
          {footer.showContactInfo && (
            <div>{data.company.name} • {data.company.phone} • {data.company.email}</div>
          )}
          {footer.showPageNumbers && (
            <div className="mt-2">Sayfa 1</div>
          )}
        </div>
      )}
    </div>
  );
};

// Section Components
const CustomerInfoSection: React.FC<{ data: any; colors: any; fonts: any }> = ({ data, colors, fonts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-3" style={{ color: colors.primary }}>Müşteri Bilgileri</h3>
      <div className="space-y-1 text-sm">
        <div><strong>Şirket:</strong> {data.customer.company}</div>
        <div><strong>Yetkili:</strong> {data.customer.contact}</div>
        <div><strong>E-posta:</strong> {data.customer.email}</div>
        <div><strong>Telefon:</strong> {data.customer.phone}</div>
        <div><strong>Adres:</strong> {data.customer.address}</div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-3" style={{ color: colors.primary }}>Teklif Bilgileri</h3>
      <div className="space-y-1 text-sm">
        <div><strong>Teklif No:</strong> {data.proposal.number}</div>
        <div><strong>Tarih:</strong> {data.proposal.date}</div>
        <div><strong>Geçerlilik:</strong> {data.proposal.validUntil}</div>
        <div><strong>Durum:</strong> <Badge variant="outline">{data.proposal.status}</Badge></div>
        <div><strong>Para Birimi:</strong> {data.proposal.currency}</div>
      </div>
    </div>
  </div>
);

const ItemsTableSection: React.FC<{ data: any; colors: any; fonts: any; designSettings: any }> = ({ 
  data, colors, fonts, designSettings 
}) => {
  const tableSettings = designSettings.table || {};
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ borderColor: tableSettings.borderColor }}>
        <thead>
          <tr style={{ backgroundColor: tableSettings.headerBackground, color: tableSettings.headerText }}>
            <th className="border p-3 text-left font-semibold">Açıklama</th>
            <th className="border p-3 text-center font-semibold">Miktar</th>
            <th className="border p-3 text-center font-semibold">Birim</th>
            <th className="border p-3 text-right font-semibold">Birim Fiyat</th>
            <th className="border p-3 text-right font-semibold">İndirim</th>
            <th className="border p-3 text-right font-semibold">KDV</th>
            <th className="border p-3 text-right font-semibold">Toplam</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, index: number) => (
            <tr 
              key={item.id}
              className={tableSettings.rowAlternating && index % 2 === 1 ? 'bg-gray-50' : ''}
            >
              <td className="border p-3">{item.description}</td>
              <td className="border p-3 text-center">{item.quantity}</td>
              <td className="border p-3 text-center">{item.unit}</td>
              <td className="border p-3 text-right">{item.unitPrice.toLocaleString('tr-TR')} ₺</td>
              <td className="border p-3 text-right">{item.discount}%</td>
              <td className="border p-3 text-right">{item.tax}%</td>
              <td className="border p-3 text-right font-semibold">{item.total.toLocaleString('tr-TR')} ₺</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TotalsSection: React.FC<{ data: any; colors: any; fonts: any }> = ({ data, colors, fonts }) => (
  <div className="flex justify-end">
    <div className="w-80 p-4 border rounded-lg" style={{ backgroundColor: colors.accent + '10' }}>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Ara Toplam:</span>
          <span>{data.totals.subtotal.toLocaleString('tr-TR')} ₺</span>
        </div>
        <div className="flex justify-between">
          <span>İndirim:</span>
          <span>-{data.totals.discountTotal.toLocaleString('tr-TR')} ₺</span>
        </div>
        <div className="flex justify-between">
          <span>KDV:</span>
          <span>{data.totals.taxTotal.toLocaleString('tr-TR')} ₺</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-bold text-lg" style={{ color: colors.primary }}>
            <span>GENEL TOPLAM:</span>
            <span>{data.totals.grandTotal.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TermsSection: React.FC<{ data: any; colors: any; fonts: any }> = ({ data, colors, fonts }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-lg" style={{ color: colors.primary }}>Şartlar ve Koşullar</h3>
    {data.terms.map((term: any, index: number) => (
      <div key={index} className="p-3 border-l-4" style={{ borderLeftColor: colors.primary }}>
        <h4 className="font-medium mb-1">{term.title}</h4>
        <p className="text-sm text-muted-foreground">{term.content}</p>
      </div>
    ))}
  </div>
);