import React, { useState } from "react";
import { TemplateSection, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Edit, EyeOff, GripVertical } from "lucide-react";

interface HeaderSectionRendererProps {
  section: TemplateSection;
  designSettings: TemplateDesignSettings;
  sampleData: any;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const HeaderSectionRenderer: React.FC<HeaderSectionRendererProps> = ({
  section,
  designSettings,
  sampleData,
  onEdit,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colors, fonts, header, branding } = designSettings;

  if (!header.enabled) return null;

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

      {/* Header Content */}
      <div 
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
    </div>
  );
};