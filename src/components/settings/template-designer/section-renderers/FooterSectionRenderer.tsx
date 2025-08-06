import React, { useState } from "react";
import { TemplateSection, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Edit, EyeOff, GripVertical } from "lucide-react";

interface FooterSectionRendererProps {
  section: TemplateSection;
  designSettings: TemplateDesignSettings;
  sampleData: any;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const FooterSectionRenderer: React.FC<FooterSectionRendererProps> = ({
  section,
  designSettings,
  sampleData,
  onEdit,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colors, fonts, footer, branding } = designSettings;

  if (!footer.enabled) return null;

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

      {/* Footer Content */}
      <div 
        className="pt-8 mt-8 border-t text-center"
        style={{
          backgroundColor: footer.backgroundColor,
          color: footer.textColor,
          borderColor: colors.border,
          fontSize: fonts.sizes.small,
        }}
      >
        <div className="flex justify-between items-center">
          {footer.showContactInfo && (
            <div className="text-left">
              <p className="font-medium">{branding.companyName}</p>
              {branding.website && <p className="text-xs opacity-75">{branding.website}</p>}
              <p className="text-xs opacity-75">info@ornek.com | +90 555 123 4567</p>
            </div>
          )}
          
          <div className="flex-1 text-center">
            <p className="text-xs opacity-60">
              Bu teklif {new Date().getFullYear()} tarihinde oluşturulmuştur.
            </p>
          </div>

          {footer.showPageNumbers && (
            <div className="text-right">
              <p className="text-xs opacity-75">Sayfa 1 / 1</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};