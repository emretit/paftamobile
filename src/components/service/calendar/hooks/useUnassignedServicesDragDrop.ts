
import { useToast } from "@/components/ui/use-toast";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { useDragAndDrop } from "../useDragAndDrop";

export const useUnassignedServicesDragDrop = (services: ServiceRequest[]) => {
  const { handleDropToUnassigned } = useDragAndDrop();
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      // Parse the dropped data
      const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // Find the service in the services array
      const droppedService = services.find(service => service.id === droppedData.id);
      
      if (droppedService && droppedService.assigned_to) {
        // Handle unassigning the service
        const success = await handleDropToUnassigned(droppedService);
        
        if (!success) {
          toast({
            title: "Atama kaldırılamadı",
            description: "Servis talebi atanmamış olarak güncellenemedi",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      toast({
        title: "Hata",
        description: "Sürükle bırak işlemi sırasında bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  return {
    handleDragOver,
    handleDrop
  };
};
