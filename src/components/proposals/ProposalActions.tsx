
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";
import { seedProposals } from "@/utils/seedSampleData"; 
import { useToast } from "@/components/ui/use-toast";

interface ProposalActionsProps {
  onCreateClick: () => void;
}

const ProposalActions = ({ onCreateClick }: ProposalActionsProps) => {
  const { toast } = useToast();

  const handleSeedData = async () => {
    try {
      toast({
        title: "Örnek Veriler Yükleniyor",
        description: "Örnek teklifler yükleniyor, lütfen bekleyin...",
      });
      
      await seedProposals();
      
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Teklifler</h1>
        <p className="text-sm text-muted-foreground">
          Müşterilere gönderilen teklifleri yönetin ve takip edin
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSeedData} className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Örnek Veriler Ekle</span>
        </Button>
        <Button onClick={onCreateClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Teklif</span>
        </Button>
      </div>
    </div>
  );
};

export default ProposalActions;
