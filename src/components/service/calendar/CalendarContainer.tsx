
import React from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { CalendarEvent } from "./calendarUtils";
import { EventCalendar } from "./EventCalendar";
import { UnassignedServicesPanel } from "./UnassignedServicesPanel";
import { useCalendar } from "./CalendarContext";
import { useDragAndDrop } from "./useDragAndDrop";

interface CalendarContainerProps {
  events: CalendarEvent[];
  services: ServiceRequest[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  events,
  services,
  onSelectEvent
}) => {
  const { 
    isPanelCollapsed, 
    setIsPanelCollapsed, 
    currentView, 
    setCurrentView,
    currentDate,
    setCurrentDate,
    technicians
  } = useCalendar();
  const { handleDragStart, handleDropFromOutside } = useDragAndDrop();

  const handlePanelToggle = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  return (
    <div className="flex h-[700px]">
      <div className="flex-1 overflow-hidden">
        <EventCalendar 
          events={events} 
          onSelectEvent={onSelectEvent}
          onDropFromOutside={handleDropFromOutside}
          technicians={technicians}
          currentView={currentView}
          onViewChange={setCurrentView}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
      
      <UnassignedServicesPanel 
        services={services}
        isCollapsed={isPanelCollapsed}
        togglePanel={handlePanelToggle}
        dragStart={handleDragStart}
      />
    </div>
  );
};
