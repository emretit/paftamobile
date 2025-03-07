
import { useState, useRef } from "react";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { mapServiceRequestsToEvents, CalendarEvent } from "./calendar/calendarUtils";
import { EventCalendar } from "./calendar/EventCalendar";
import { UnassignedServicesPanel } from "./calendar/UnassignedServicesPanel";
import { useCalendarEventService } from "./calendar/calendarEventService";
import { useTechnicians } from "@/hooks/useTechnicians";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Layers } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceRequestCalendarProps {
  searchQuery: string;
  statusFilter: string | null;
  technicianFilter: string | null;
  onSelectRequest: (request: ServiceRequest) => void;
}

export const ServiceRequestCalendar = ({
  searchQuery,
  statusFilter,
  technicianFilter,
  onSelectRequest
}: ServiceRequestCalendarProps) => {
  const { data: serviceRequests, isLoading, error } = useServiceRequests();
  const { technicians, isLoading: isTechniciansLoading } = useTechnicians();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedService, setDraggedService] = useState<ServiceRequest | null>(null);
  const { handleUnassignedServiceDrop } = useCalendarEventService();

  const handlePanelToggle = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

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
      await handleUnassignedServiceDrop(draggedService, technicianId, date);
    }
    
    // Reset the dragged service
    setDraggedService(null);
  };

  if (isLoading || isTechniciansLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Servis talepleri yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Servis talepleri yüklenirken hata oluştu</div>
      </div>
    );
  }

  const events = mapServiceRequestsToEvents(
    serviceRequests || [],
    searchQuery,
    statusFilter,
    technicianFilter,
    technicians || []
  );

  const handleSelectEvent = (event: CalendarEvent) => {
    onSelectRequest(event.resource);
  };

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Servis Takvimi</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Layers className="h-4 w-4 mr-2" />
                {currentView === 'month' ? 'Aylık' : currentView === 'week' ? 'Haftalık' : 'Günlük'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCurrentView('month')}>
                Aylık Görünüm
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView('week')}>
                Haftalık Görünüm
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView('day')}>
                Günlük Görünüm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {currentView !== 'month' && (
            <Select
              value={technicianFilter || "all"}
              onValueChange={(value) => console.log("Selected technician:", value)}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Teknisyen seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Teknisyenler</SelectItem>
                {technicians?.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="flex h-[700px]">
        <div className="flex-1 overflow-hidden">
          <EventCalendar 
            events={events} 
            onSelectEvent={handleSelectEvent} 
            onDropFromOutside={handleDropFromOutside}
            technicians={technicians || []}
            currentView={currentView}
            onViewChange={setCurrentView}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        </div>
        
        <UnassignedServicesPanel 
          services={serviceRequests || []}
          isCollapsed={isPanelCollapsed}
          togglePanel={handlePanelToggle}
          dragStart={handleDragStart}
        />
      </div>
    </div>
  );
};
