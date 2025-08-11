import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const PdfTemplateEditor: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PDF Şablon Editörü</h1>
            <p className="text-muted-foreground">PDF şablon sistemi yeniden yapılandırılıyor</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Sistem Güncelleniyor</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF şablon sistemi şu anda yeniden yapılandırılıyor. Yakında daha gelişmiş özelliklerle geri dönecek.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PdfTemplateEditor;