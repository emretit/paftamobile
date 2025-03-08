
import { useState } from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { useCalendarEventService } from "./calendarEventService";
import { useCalendar } from "./CalendarContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export const useDragAndDrop = () => {
  const { draggedService, setDraggedService, currentView, technicians } = useCalendar();
  const { handleUnassignedServiceDrop, unassignService } = useCalendarEventService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, service: ServiceRequest) => {
    setDraggedService(service);
    // Set drag data for the event
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: service.id,
      title: service.title
    }));
    
    // Create a custom drag image that looks better
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `<div style="padding: 8px 12px; background: #805AD5; color: white; border-radius: 4px; font-family: system-ui; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${service.title}</div>`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    
    // We need to clean up the element after the drag ends
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDropFromOutside = async (date: Date, technicianId: string | null) => {
    if (!draggedService) return;
    
    // If there's no technician selected in resources view, show an error
    if (!technicianId && currentView === 'week') {
      toast({
        title: "Teknisyen seçilmedi",
        description: "Lütfen bir teknisyen seçin veya aylık görünümde sürükleyin",
        variant: "destructive",
      });
      return;
    }
    
    // For month view or day view, prompt the user to select a technician if none is selected
    if (!technicianId) {
      // If technicians exist, use the first one as default
      technicianId = technicians?.[0]?.id || null;
      
      if (!technicianId) {
        toast({
          title: "Teknisyen bulunamadı",
          description: "Sistemde kayıtlı teknisyen bulunamadı",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Assign the service to the technician on the selected date
    if (technicianId) {
      const success = await handleUnassignedServiceDrop(draggedService, technicianId, date);
      
      // If assignment was successful, manually trigger a data refresh
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['service-requests'] });
        toast({
          title: "Servis atandı",
          description: "Servis talebi başarıyla atandı",
          variant: "default",
        });
      }
    }
    
    // Reset the dragged service
    setDraggedService(null);
  };

  const handleDropToUnassigned = async (service: ServiceRequest) => {
    if (!service) return false;
    
    // Unassign the service
    const success = await unassignService(service.id);
    
    // If unassignment was successful, manually trigger a data refresh
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      return true;
    }
    
    return false;
  };

  return {
    handleDragStart,
    handleDropFromOutside,
    handleDropToUnassigned
  };
};
