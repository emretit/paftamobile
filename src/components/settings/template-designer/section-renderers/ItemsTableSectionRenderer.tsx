import React, { useState } from "react";
import { TemplateSection, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Edit, EyeOff, GripVertical } from "lucide-react";

interface ItemsTableSectionRendererProps {
  section: TemplateSection;
  designSettings: TemplateDesignSettings;
  sampleData: any;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const ItemsTableSectionRenderer: React.FC<ItemsTableSectionRendererProps> = ({
  section,
  designSettings,
  sampleData,
  onEdit,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colors, fonts, layout } = designSettings;

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

      {/* Items Table Content */}
      <div>
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
          {sampleData.items.map((item: any, index: number) => (
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
    </div>
  );
};