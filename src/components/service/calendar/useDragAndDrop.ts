
import { useState } from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { useCalendarEventService } from "./calendarEventService";
import { useCalendar } from "./CalendarContext";
import { useQueryClient } from "@tanstack/react-query";

export const useDragAndDrop = () => {
  const { draggedService, setDraggedService, currentView, technicians } = useCalendar();
  const { handleUnassignedServiceDrop } = useCalendarEventService();
  const queryClient = useQueryClient();

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
    if (!technicianId && currentView !== 'month') {
      console.error('No technician selected');
      return;
    }
    
    // For month view, prompt the user to select a technician
    if (currentView === 'month') {
      // For simplicity, we're just using the first technician
      // In a real app, you'd show a modal to select a technician
      technicianId = technicians?.[0]?.id || null;
      
      if (!technicianId) {
        console.error('No technicians available');
        return;
      }
    }
    
    // Assign the service to the technician on the selected date
    if (technicianId) {
      const success = await handleUnassignedServiceDrop(draggedService, technicianId, date);
      
      // If assignment was successful, manually trigger a data refresh
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      }
    }
    
    // Reset the dragged service
    setDraggedService(null);
  };

  return {
    handleDragStart,
    handleDropFromOutside
  };
};
