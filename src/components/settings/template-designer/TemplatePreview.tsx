import React from "react";
import { ProposalTemplate, TemplateDesignSettings } from "@/types/proposal-template";

interface TemplatePreviewProps {
  template: ProposalTemplate;
  designSettings: TemplateDesignSettings;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  designSettings,
}) => {
  const { colors, fonts, header, layout } = designSettings;

  // Sample data for preview
  const sampleData = {
    proposalNumber: "TKL-2024-001",
    date: "15 Ocak 2024",
    customer: "Örnek Şirket A.Ş.",
    items: [
      { description: "Web Sitesi Tasarımı", quantity: 1, price: 5000, total: 5000 },
      { description: "SEO Optimizasyonu", quantity: 1, price: 2000, total: 2000 },
      { description: "Hosting (1 Yıl)", quantity: 1, price: 1200, total: 1200 },
    ],
    subtotal: 8200,
    tax: 1476,
    total: 9676,
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Preview Header */}
      <div className="bg-muted/50 px-4 py-2 border-b">
        <p className="text-sm text-muted-foreground">
          PDF Önizlemesi - {designSettings.pageSize} {designSettings.orientation === 'landscape' ? 'Yatay' : 'Dikey'}
        </p>
      </div>

      {/* Document Preview */}
      <div 
        className="p-8 space-y-6"
        style={{
          fontFamily: fonts.primary,
          color: colors.text,
          backgroundColor: colors.background,
        }}
      >
        {/* Header Section */}
        {header.enabled && (
          <div 
            className="flex items-center justify-between pb-4 border-b"
            style={{
              backgroundColor: header.backgroundColor,
              color: header.textColor,
              borderColor: colors.border,
            }}
          >
            <div className={`flex items-center ${header.logoPosition === 'center' ? 'justify-center' : header.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                LOGO
              </div>
              {header.showCompanyInfo && (
                <div className="ml-4">
                  <h2 className="font-semibold" style={{ fontSize: fonts.sizes.heading }}>
                    Şirket Adı
                  </h2>
                  <p className="text-sm opacity-75">Adres Bilgisi</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <h1 
                className="font-bold" 
                style={{ 
                  fontSize: fonts.sizes.title,
                  color: colors.primary 
                }}
              >
                TEKLİF
              </h1>
            </div>
          </div>
        )}

        {/* Proposal Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
              Teklif Bilgileri
            </h3>
            <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
              <p><span className="font-medium">Teklif No:</span> {sampleData.proposalNumber}</p>
              <p><span className="font-medium">Tarih:</span> {sampleData.date}</p>
              <p><span className="font-medium">Geçerlilik:</span> 30 gün</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
              Müşteri Bilgileri
            </h3>
            <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
              <p><span className="font-medium">Firma:</span> {sampleData.customer}</p>
              <p><span className="font-medium">Telefon:</span> +90 555 123 4567</p>
              <p><span className="font-medium">E-posta:</span> info@ornek.com</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="font-semibold mb-3" style={{ fontSize: fonts.sizes.heading }}>
            Teklif Kalemleri
          </h3>
          <div 
            className={`overflow-hidden ${layout.roundedCorners ? 'rounded-lg' : ''}`}
            style={{
              border: layout.showBorders ? `1px solid ${colors.border}` : 'none',
            }}
          >
            {/* Table Header */}
            <div 
              className="grid grid-cols-12 gap-4 p-3 font-medium"
              style={{
                backgroundColor: designSettings.table.headerBackground,
                color: designSettings.table.headerText,
                fontSize: fonts.sizes.body,
              }}
            >
              <div className="col-span-6">Açıklama</div>
              <div className="col-span-2 text-center">Miktar</div>
              <div className="col-span-2 text-right">Birim Fiyat</div>
              <div className="col-span-2 text-right">Toplam</div>
            </div>

            {/* Table Rows */}
            {sampleData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-3"
                style={{
                  backgroundColor: designSettings.table.rowAlternating && index % 2 === 1 
                    ? `${colors.primary}10` : 'transparent',
                  borderTop: layout.showBorders ? `1px solid ${colors.border}` : 'none',
                  fontSize: fonts.sizes.body,
                }}
              >
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">{item.price.toLocaleString('tr-TR')} ₺</div>
                <div className="col-span-2 text-right font-medium">{item.total.toLocaleString('tr-TR')} ₺</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span>{sampleData.subtotal.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>KDV (%18):</span>
              <span>{sampleData.tax.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div 
              className="flex justify-between font-bold text-lg pt-2 border-t"
              style={{ 
                borderColor: colors.border,
                color: colors.primary 
              }}
            >
              <span>Genel Toplam:</span>
              <span>{sampleData.total.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
          <div className="text-sm space-y-2" style={{ fontSize: fonts.sizes.small }}>
            <p><strong>Ödeme Şartları:</strong> Peşin ödeme</p>
            <p><strong>Teslimat Şartları:</strong> 30 iş günü</p>
            <p><strong>Notlar:</strong> Bu teklif 30 gün süreyle geçerlidir.</p>
          </div>
        </div>
      </div>
    </div>
  );
};