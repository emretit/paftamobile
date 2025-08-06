import React, { useState } from "react";
import { TemplateSection, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Edit, EyeOff, GripVertical } from "lucide-react";

interface ProposalInfoSectionRendererProps {
  section: TemplateSection;
  designSettings: TemplateDesignSettings;
  sampleData: any;
  onEdit?: () => void;
  onToggle?: () => void;
}

export const ProposalInfoSectionRenderer: React.FC<ProposalInfoSectionRendererProps> = ({
  section,
  designSettings,
  sampleData,
  onEdit,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { fonts } = designSettings;

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

      {/* Proposal Info Content */}
      <div>
        <h3 className="font-semibold mb-2" style={{ fontSize: fonts.sizes.heading }}>
          {section.title}
        </h3>
        <div className="space-y-1" style={{ fontSize: fonts.sizes.body }}>
          <p><span className="font-medium">Teklif No:</span> {sampleData.proposalNumber}</p>
          <p><span className="font-medium">Tarih:</span> {sampleData.date}</p>
          <p><span className="font-medium">Geçerlilik:</span> 30 gün</p>
          <p><span className="font-medium">Hazırlayan:</span> Sistem Yöneticisi</p>
        </div>
      </div>
    </div>
  );
};