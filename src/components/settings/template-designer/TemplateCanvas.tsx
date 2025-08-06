import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Grid } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";

interface TemplateCanvasProps {
  template: ProposalTemplate;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({ template }) => {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

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

  // A4 dimensions: 210mm x 297mm = 794px x 1123px at 96 DPI
  const pageWidth = 794;
  const pageHeight = 1123;
  const scaledWidth = (pageWidth * zoom) / 100;
  const scaledHeight = (pageHeight * zoom) / 100;

  // Sample data for preview
  const sampleData = {
    proposalNumber: "TKL-2024-001",
    date: "15 Ocak 2024",
    customer: {
      name: "Örnek Şirket A.Ş.",
      contact: "Ahmet Yılmaz",
      email: "ahmet@ornek.com",
      phone: "+90 212 555 0123",
      address: "Maslak Mahallesi, Büyükdere Cad. No:123 Sarıyer/İstanbul",
    },
    items: [
      { description: "Web Sitesi Tasarımı", quantity: 1, price: 15000, total: 15000 },
      { description: "SEO Optimizasyonu", quantity: 1, price: 5000, total: 5000 },
      { description: "Hosting (1 Yıl)", quantity: 1, price: 2400, total: 2400 },
    ],
    subtotal: 22400,
    discount: 2000,
    tax: 3672,
    total: 24072,
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
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
            Izgara
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-center">
          <Card
            className="relative shadow-xl bg-white overflow-hidden"
            style={{
              width: scaledWidth,
              height: scaledHeight,
              minHeight: scaledHeight,
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
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
              className="relative h-full"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: pageWidth,
                height: pageHeight,
                padding: '40px',
                fontFamily: 'Inter',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Header Section */}
              <div className="flex items-start justify-between pb-8 border-b mb-8">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mr-6">
                    LOGO
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Şirket Adı</h2>
                    <p className="text-muted-foreground">Profesyonel Hizmetler</p>
                    <p className="text-sm text-muted-foreground">www.sirket.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-bold text-primary">
                    TEKLİF
                  </h1>
                  <p className="text-muted-foreground mt-2">#{sampleData.proposalNumber}</p>
                  <p className="text-sm text-muted-foreground">{sampleData.date}</p>
                </div>
              </div>

              {/* Customer Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium">{sampleData.customer.name}</h4>
                  <p className="text-sm text-muted-foreground">{sampleData.customer.contact}</p>
                  <p className="text-sm text-muted-foreground">{sampleData.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{sampleData.customer.phone}</p>
                  <p className="text-sm text-muted-foreground mt-2">{sampleData.customer.address}</p>
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Hizmet Kalemleri</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Açıklama</th>
                      <th className="text-center py-2 w-20">Adet</th>
                      <th className="text-right py-2 w-24">Birim Fiyat</th>
                      <th className="text-right py-2 w-24">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.items.map((item, index) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">{item.price.toLocaleString('tr-TR')} ₺</td>
                        <td className="py-3 text-right font-medium">{item.total.toLocaleString('tr-TR')} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ara Toplam:</span>
                      <span>{sampleData.subtotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>İndirim:</span>
                      <span>-{sampleData.discount.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KDV (%18):</span>
                      <span>{sampleData.tax.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t text-primary">
                      <span>Genel Toplam:</span>
                      <span>{sampleData.total.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Şartlar ve Koşullar</h3>
                <div className="text-sm space-y-2">
                  <p>• Teklif geçerlilik süresi: 30 gün</p>
                  <p>• Ödeme şekli: %50 peşin, %50 teslimde</p>
                  <p>• Proje teslim süresi: 4-6 hafta</p>
                  <p>• Fiyatlara KDV dahildir</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-4 bg-card border-t text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>A4 Sayfa • Dikey • {scaledWidth}×{scaledHeight}px ({zoom}%)</span>
          <span>5 bölüm</span>
        </div>
      </div>
    </div>
  );
};