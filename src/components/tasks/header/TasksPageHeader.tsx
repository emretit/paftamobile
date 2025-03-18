
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";
import { seedTasks } from "@/utils/seedSampleData";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TasksPageHeaderProps {
  onCreateTask: () => void;
}

const TasksPageHeader = ({ onCreateTask }: TasksPageHeaderProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      toast({
        title: "Örnek Veriler Yükleniyor",
        description: "Örnek görevler yükleniyor, lütfen bekleyin...",
      });
      
      const result = await seedTasks();
      
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Örnek görevler başarıyla eklendi!",
          variant: "success",
        });
        
        // Refresh the tasks data
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        toast({
          title: "Hata",
          description: "Örnek veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "Hata",
        description: "Örnek veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Görevler</h1>
        <p className="text-sm text-muted-foreground">
          Tüm görevlerinizi yönetin ve takip edin
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleSeedData} 
          className="flex items-center gap-2"
          disabled={isSeeding}
        >
          <Database className="h-4 w-4" />
          <span>{isSeeding ? "Yükleniyor..." : "Örnek Veriler Ekle"}</span>
        </Button>
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Görev</span>
        </Button>
      </div>
    </div>
  );
};

export default TasksPageHeader;
