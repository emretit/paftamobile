import React, { useState } from "react";
import { TemplateSection, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Edit, EyeOff, GripVertical } from "lucide-react";

interface TermsSectionRendererProps {
  section: TemplateSection;
  designSettings: TemplateDesignSettings;
  sampleData: any;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const TermsSectionRenderer: React.FC<TermsSectionRendererProps> = ({
  section,
  designSettings,
  sampleData,
  onEdit,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colors, fonts } = designSettings;

  const showPayment = section.settings?.showPaymentTerms ?? true;
  const showPricing = section.settings?.showPricingTerms ?? true;
  const showWarranty = section.settings?.showWarrantyTerms ?? true;
  const showDelivery = section.settings?.showDeliveryTerms ?? true;
  const categorize = section.settings?.categorizeTerms ?? true;
  const showIcons = section.settings?.showTermsIcons ?? false;

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Overlay */}
      {isHovered && (onEdit || onToggle) && (
        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-primary rounded-lg bg-primary/5 z-10">
          <div className="absolute -top-8 left-0 flex items-center gap-1">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
              {section.title}
            </div>
            <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={onEdit}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={onToggle}>
              <EyeOff className="w-3 h-3" />
            </Button>
            <div className="cursor-move p-1">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Terms Content */}
      <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
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
            {showDelivery && <p><strong>Teslimat:</strong> 15 gün içinde teslim edilir.</p>}
          </div>
        )}
      </div>
    </div>
  );
};