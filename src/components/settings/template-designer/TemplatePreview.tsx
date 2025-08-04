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
  const { colors, fonts, header, layout, sections, branding } = designSettings;

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
    // Hesaplama mantığı: Brüt -> İndirim -> Net -> KDV -> Toplam
    gross: 8200, // Brüt toplam
    discount: 500, // İndirim
    net: 7700, // Net (Brüt - İndirim)
    tax: 1386, // KDV (Net * 0.18)
    total: 9086, // Toplam (Net + KDV)
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
        className={`p-8 ${layout.spacing === 'compact' ? 'space-y-4' : layout.spacing === 'spacious' ? 'space-y-8' : 'space-y-6'}`}
        style={{
          fontFamily: fonts.primary,
          color: colors.text,
          backgroundColor: colors.background,
        }}
      >
        {/* Dynamic Sections Based on Design Settings */}
        {sections
          .filter(section => section.enabled)
          .sort((a, b) => a.order - b.order)
          .map((section) => {
            switch (section.type) {
              case 'header':
                return header.enabled && (
                  <div 
                    key={section.id}
                    className="flex items-center justify-between pb-4 border-b"
                    style={{
                      backgroundColor: header.backgroundColor,
                      color: header.textColor,
                      borderColor: colors.border,
                    }}
                  >
                    <div className={`flex items-center ${header.logoPosition === 'center' ? 'justify-center' : header.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {section.settings?.showLogo !== false && (
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                          LOGO
                        </div>
                      )}
                      {section.settings?.showCompanyInfo !== false && (
                        <div className={section.settings?.showLogo !== false ? "ml-4" : ""}>
                          <h2 className="font-semibold" style={{ fontSize: fonts.sizes.heading }}>
                            {branding.companyName}
                          </h2>
                          {branding.tagline && <p className="text-sm opacity-75">{branding.tagline}</p>}
                          {branding.website && <p className="text-xs opacity-60">{branding.website}</p>}
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
                );

               case 'proposal-info':
               case 'customer-info':
                 // Handle customer and proposal info side by side
                 const proposalInfoSection = sections.find(s => s.type === 'proposal-info' && s.enabled);
                 const customerInfoSection = sections.find(s => s.type === 'customer-info' && s.enabled);
                 
                 // Only render once when we encounter either section
                 if (section.type === 'customer-info' && proposalInfoSection) {
                   return null; // Skip if proposal-info will handle the rendering
                 }
                 
                 if (section.type === 'proposal-info' && customerInfoSection) {
                   // Render both sections side by side
                   return (
                     <div key="customer-proposal-info" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Customer Info - Left Side */}
                       <div>
                         <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
                           {customerInfoSection.title}
                         </h3>
                         <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
                           <p><span className="font-medium">Firma:</span> {sampleData.customer}</p>
                           <p><span className="font-medium">Telefon:</span> +90 555 123 4567</p>
                           <p><span className="font-medium">E-posta:</span> info@ornek.com</p>
                         </div>
                       </div>
                       
                       {/* Proposal Info - Right Side */}
                       <div>
                         <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
                           {proposalInfoSection.title}
                         </h3>
                         <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
                           <p><span className="font-medium">Teklif No:</span> {sampleData.proposalNumber}</p>
                           <p><span className="font-medium">Tarih:</span> {sampleData.date}</p>
                           <p><span className="font-medium">Geçerlilik:</span> 30 gün</p>
                         </div>
                       </div>
                     </div>
                   );
                 }
                 
                 // Handle individual sections if only one is enabled
                 if (section.type === 'customer-info' && !proposalInfoSection) {
                   return (
                     <div key={section.id}>
                       <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
                         {section.title}
                       </h3>
                       <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
                         <p><span className="font-medium">Firma:</span> {sampleData.customer}</p>
                         <p><span className="font-medium">Telefon:</span> +90 555 123 4567</p>
                         <p><span className="font-medium">E-posta:</span> info@ornek.com</p>
                       </div>
                     </div>
                   );
                 }
                 
                 if (section.type === 'proposal-info' && !customerInfoSection) {
                   return (
                     <div key={section.id}>
                       <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
                         {section.title}
                       </h3>
                       <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
                         <p><span className="font-medium">Teklif No:</span> {sampleData.proposalNumber}</p>
                         <p><span className="font-medium">Tarih:</span> {sampleData.date}</p>
                         <p><span className="font-medium">Geçerlilik:</span> 30 gün</p>
                       </div>
                     </div>
                   );
                 }
                 
                 return null;

              case 'items-table':
                return (
                  <div key={section.id}>
                    <h3 className="font-semibold mb-3" style={{ fontSize: fonts.sizes.heading }}>
                      {section.title}
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
                        <div className={`${section.settings?.showProductImages === true ? 'col-span-5' : 'col-span-6'}`}>
                          {section.settings?.showProductImages === true ? 'Ürün / Açıklama' : 'Açıklama'}
                        </div>
                        {section.settings?.showProductImages === true && <div className="col-span-1"></div>}
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
                            backgroundColor: section.settings?.alternatingRows !== false && designSettings.table.rowAlternating && index % 2 === 1 
                              ? `${colors.primary}10` : 'transparent',
                            borderTop: layout.showBorders ? `1px solid ${colors.border}` : 'none',
                            fontSize: fonts.sizes.body,
                          }}
                        >
                          <div className={`${section.settings?.showProductImages === true ? 'col-span-5' : 'col-span-6'} flex items-center gap-2`}>
                            {section.settings?.showProductImages === true && (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                                📦
                              </div>
                            )}
                            <span>{item.description}</span>
                          </div>
                          {section.settings?.showProductImages === true && <div className="col-span-1"></div>}
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-right">{item.price.toLocaleString('tr-TR')} ₺</div>
                          <div className="col-span-2 text-right font-medium">{item.total.toLocaleString('tr-TR')} ₺</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'totals':
                return (
                  <div key={section.id} className="flex justify-end">
                    <div className="w-80 space-y-2">
                      {/* 1. Brüt (toggle ile kontrol) */}
                      {section.settings?.showGross !== false && (
                        <div className="flex justify-between">
                          <span>Brüt:</span>
                          <span>{sampleData.gross.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      )}
                      
                      {/* 2. İndirim (toggle ile kontrol) */}
                      {section.settings?.showDiscounts === true && (
                        <div className="flex justify-between text-green-600">
                          <span>İndirim:</span>
                          <span>-{sampleData.discount.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      )}
                      
                      {/* 3. Net (toggle ile kontrol) */}
                      {section.settings?.showNet !== false && (
                        <div className="flex justify-between font-medium">
                          <span>Net:</span>
                          <span>{sampleData.net.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      )}
                      
                      {/* 4. KDV (toggle ile kontrol) */}
                      {section.settings?.showTaxDetails !== false && (
                        <div className="flex justify-between">
                          <span>KDV (%18):</span>
                          <span>{sampleData.tax.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      )}
                      
                      {/* 5. Toplam */}
                      <div 
                        className="flex justify-between font-bold text-lg pt-2 border-t"
                        style={{ 
                          borderColor: colors.border,
                          color: colors.primary 
                        }}
                      >
                        <span>Toplam:</span>
                        <span>{sampleData.total.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    </div>
                  </div>
                );

              case 'terms':
                const showPayment = section.settings?.showPaymentTerms ?? true;
                const showPricing = section.settings?.showPricingTerms ?? true;
                const showWarranty = section.settings?.showWarrantyTerms ?? true;
                const showDelivery = section.settings?.showDeliveryTerms ?? true;
                const categorize = section.settings?.categorizeTerms ?? true;
                const showIcons = section.settings?.showTermsIcons ?? false;

                return (
                  <div key={section.id} className="pt-6 border-t" style={{ borderColor: colors.border }}>
                    <h3 className="font-semibold mb-4" style={{ fontSize: fonts.sizes.heading }}>
                      {section.title}
                    </h3>
                    
                    {categorize ? (
                      <div className="space-y-4" style={{ fontSize: fonts.sizes.small }}>
                        {/* Ödeme Şartları */}
                        {showPayment && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                              {showIcons && <span>💳</span>}
                              ÖDEME ŞARTLARI:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>%100 peşin ödeme yapılacaktır.</li>
                              <li>Belirtilen fiyatlar KDV hariçtir.</li>
                            </ul>
                          </div>
                        )}

                        {/* Fiyat Bilgileri */}
                        {showPricing && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                              {showIcons && <span>💰</span>}
                              FİYATLAR:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Tüm fiyatlar Türk Lirası (TL) cinsindendir.</li>
                              <li>Bu teklif 30 gün süreyle geçerlidir.</li>
                            </ul>
                          </div>
                        )}

                        {/* Garanti */}
                        {showWarranty && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                              {showIcons && <span>🛡️</span>}
                              GARANTİ:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Ürünlerimiz fatura tarihinden itibaren 2(iki) yıl garantilidir.</li>
                            </ul>
                          </div>
                        )}

                        {/* Teslimat */}
                        {showDelivery && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                              {showIcons && <span>🚚</span>}
                              STOK VE TESLİMAT:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Ürünler siparişten sonra 15 gün içinde teslim edilecektir.</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm space-y-2" style={{ fontSize: fonts.sizes.small }}>
                        {showPayment && <p><strong>Ödeme:</strong> %100 peşin ödeme yapılacaktır.</p>}
                        {showPricing && <p><strong>Fiyatlar:</strong> KDV hariç TL cinsindendir.</p>}
                        {showWarranty && <p><strong>Garanti:</strong> 2 yıl garantilidir.</p>}
                        {showDelivery && <p><strong>Teslimat:</strong> 15 gün içinde teslim edilecektir.</p>}
                      </div>
                    )}
                  </div>
                );

              case 'footer':
                return (
                  <div key={section.id} className="text-center text-sm" style={{ 
                    fontSize: fonts.sizes.small,
                    color: colors.secondary 
                  }}>
                    <p>© 2024 {branding.companyName} - Tüm hakları saklıdır</p>
                    {branding.website && <p>{branding.website}</p>}
                  </div>
                );

              case 'custom':
                return (
                  <div key={section.id} className="p-4 border rounded-lg" style={{ borderColor: colors.border }}>
                    <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
                      {section.title}
                    </h3>
                    {section.settings?.customContent ? (
                      <div className="whitespace-pre-wrap text-sm" style={{ fontSize: fonts.sizes.body }}>
                        {section.settings.customContent}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Özel bölüm içeriği buraya gelecek...
                      </p>
                    )}
                  </div>
                );

              default:
                return null;
            }
          })}

      </div>
    </div>
  );
};