import React, { useState } from "react";
import { TemplateSection, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Edit, EyeOff, GripVertical } from "lucide-react";

interface TotalsSectionRendererProps {
  section: TemplateSection;
  designSettings: TemplateDesignSettings;
  sampleData: any;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const TotalsSectionRenderer: React.FC<TotalsSectionRendererProps> = ({
  section,
  designSettings,
  sampleData,
  onEdit,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colors } = designSettings;

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

      {/* Totals Content */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          {/* Brüt */}
          {section.settings?.showGross !== false && (
            <div className="flex justify-between">
              <span>Brüt:</span>
              <span>{sampleData.gross.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}
          
          {/* İndirim */}
          {section.settings?.showDiscounts === true && (
            <div className="flex justify-between text-green-600">
              <span>İndirim:</span>
              <span>-{sampleData.discount.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}
          
          {/* Net */}
          {section.settings?.showNet !== false && (
            <div className="flex justify-between font-medium">
              <span>Net:</span>
              <span>{sampleData.net.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}
          
          {/* KDV */}
          {section.settings?.showTaxDetails !== false && (
            <div className="flex justify-between">
              <span>KDV (%18):</span>
              <span>{sampleData.tax.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}
          
          {/* Toplam */}
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
    </div>
  );
};