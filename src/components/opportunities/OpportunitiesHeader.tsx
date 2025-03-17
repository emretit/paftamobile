
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";
import { seedAllData } from "@/utils/seedSampleData";
import { useToast } from "@/components/ui/use-toast";

const OpportunitiesHeader = () => {
  const { toast } = useToast();

  const handleSeedData = async () => {
    try {
      toast({
        title: "Örnek Veriler Yükleniyor",
        description: "Örnek veriler yükleniyor, lütfen bekleyin...",
      });
      
      await seedAllData();
      
      // Reload the page to show the new data
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "Hata",
        description: "Örnek veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Satış Fırsatları</h1>
        <p className="text-sm text-muted-foreground">
          Tüm satış fırsatlarınızı yönetin ve takip edin.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleSeedData} className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Örnek Veriler Ekle</span>
        </Button>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Fırsat</span>
        </Button>
      </div>
    </div>
  );
};

export default OpportunitiesHeader;
