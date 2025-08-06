import React, { useState, useRef } from "react";
import { ProposalTemplate, TemplateDesignSettings } from "@/types/proposal-template";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Grid, Ruler } from "lucide-react";
import { HeaderSectionRenderer } from "./section-renderers/HeaderSectionRenderer";
import { CustomerInfoSectionRenderer } from "./section-renderers/CustomerInfoSectionRenderer";
import { ProposalInfoSectionRenderer } from "./section-renderers/ProposalInfoSectionRenderer";
import { ItemsTableSectionRenderer } from "./section-renderers/ItemsTableSectionRenderer";
import { TotalsSectionRenderer } from "./section-renderers/TotalsSectionRenderer";
import { TermsSectionRenderer } from "./section-renderers/TermsSectionRenderer";
import { FooterSectionRenderer } from "./section-renderers/FooterSectionRenderer";

interface TemplateCanvasProps {
  template: ProposalTemplate;
  designSettings: TemplateDesignSettings;
  onSectionEdit?: (sectionId: string) => void;
  onSectionToggle?: (sectionId: string) => void;
  onSectionReorder?: (fromIndex: number, toIndex: number) => void;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  template,
  designSettings,
  onSectionEdit,
  onSectionToggle,
  onSectionReorder,
}) => {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

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
    gross: 8200,
    discount: 500,
    net: 7700,
    tax: 1386,
    total: 9086,
  };

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleFitToScreen = () => {
    setZoom(75);
  };

  const renderSection = (section: any) => {
    const commonProps = {
      section,
      designSettings,
      sampleData,
      onEdit: onSectionEdit ? () => onSectionEdit(section.id) : undefined,
      onToggle: onSectionToggle ? () => onSectionToggle(section.id) : undefined,
    };

    switch (section.type) {
      case 'header':
        return <HeaderSectionRenderer key={section.id} {...commonProps} />;
      case 'customer-info':
        return <CustomerInfoSectionRenderer key={section.id} {...commonProps} />;
      case 'proposal-info':
        return <ProposalInfoSectionRenderer key={section.id} {...commonProps} />;
      case 'items-table':
        return <ItemsTableSectionRenderer key={section.id} {...commonProps} />;
      case 'totals':
        return <TotalsSectionRenderer key={section.id} {...commonProps} />;
      case 'terms':
        return <TermsSectionRenderer key={section.id} {...commonProps} />;
      case 'footer':
        return <FooterSectionRenderer key={section.id} {...commonProps} />;
      default:
        return null;
    }
  };

  // A4 dimensions in pixels at 96 DPI: 794x1123px
  const pageWidth = 794;
  const pageHeight = 1123;
  const scaledWidth = (pageWidth * zoom) / 100;
  const scaledHeight = (pageHeight * zoom) / 100;

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_LEVELS[0]}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFitToScreen}>
            <Maximize className="w-4 h-4 mr-1" />
            Sığdır
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={showRuler ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRuler(!showRuler)}
          >
            <Ruler className="w-4 h-4 mr-1" />
            Cetvel
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-center">
          <div className="relative">
            {/* Ruler - Top */}
            {showRuler && (
              <div 
                className="absolute -top-6 left-0 bg-background border-b text-xs"
                style={{ width: scaledWidth, height: 24 }}
              >
                {Array.from({ length: Math.floor(pageWidth / 50) }, (_, i) => (
                  <div
                    key={i}
                    className="absolute border-l border-border"
                    style={{ 
                      left: (i * 50 * zoom) / 100,
                      height: '100%'
                    }}
                  >
                    <span className="absolute top-1 left-1 text-muted-foreground">
                      {i * 5}mm
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Ruler - Left */}
            {showRuler && (
              <div 
                className="absolute -left-6 top-0 bg-background border-r text-xs"
                style={{ width: 24, height: scaledHeight }}
              >
                {Array.from({ length: Math.floor(pageHeight / 50) }, (_, i) => (
                  <div
                    key={i}
                    className="absolute border-t border-border w-full"
                    style={{ 
                      top: (i * 50 * zoom) / 100,
                    }}
                  >
                    <span 
                      className="absolute left-1 text-muted-foreground"
                      style={{ 
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'left top',
                        fontSize: '10px'
                      }}
                    >
                      {i * 7}mm
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* A4 Page */}
            <Card 
              ref={canvasRef}
              className="relative shadow-lg bg-white overflow-hidden"
              style={{
                width: scaledWidth,
                height: scaledHeight,
                minHeight: scaledHeight,
              }}
            >
              {/* Grid Overlay */}
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                      linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                    `,
                    backgroundSize: `${(20 * zoom) / 100}px ${(20 * zoom) / 100}px`
                  }}
                />
              )}

              {/* Page Content */}
              <div 
                className="relative h-full p-8 print:p-8"
                style={{
                  fontFamily: fonts.primary,
                  color: colors.text,
                  backgroundColor: colors.background,
                  fontSize: `${(fonts.sizes.body * zoom) / 100}px`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                  width: pageWidth,
                  height: pageHeight,
                }}
              >
                <div className={`space-y-6 ${layout.spacing === 'compact' ? 'space-y-4' : layout.spacing === 'spacious' ? 'space-y-8' : 'space-y-6'}`}>
                  {sections
                    .filter(section => section.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map(renderSection)}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Canvas Info */}
      <div className="p-4 bg-background border-t text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            A4 Sayfa • {designSettings.orientation === 'landscape' ? 'Yatay' : 'Dikey'} • 
            {scaledWidth}×{scaledHeight}px ({zoom}%)
          </span>
          <span>{sections.filter(s => s.enabled).length} aktif bölüm</span>
        </div>
      </div>
    </div>
  );
};