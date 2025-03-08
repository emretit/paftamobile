
import { useRef } from "react";
import { useCalendarEventService } from "../calendarEventService";
import { CalendarEvent } from "../calendarUtils";
import { useCalendar } from "../CalendarContext";
import { useToast } from "@/components/ui/use-toast";

interface CalendarEventHandlersProps {
  onDropFromOutside?: (date: Date, technicianId: string | null) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const useCalendarEventHandlers = ({
  onDropFromOutside,
  onSelectEvent
}: CalendarEventHandlersProps) => {
  const { updateEventDate } = useCalendarEventService();
  const calendarRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Handle dropping from outside the calendar
  const handleDropFromOutside = ({ start, end, allDay }: any) => {
    const technicianId = calendarRef.current?.view?.props?.resource?.technicianId || null;
    
    if (onDropFromOutside) {
      onDropFromOutside(start, technicianId);
    }
  };

  // Handle moving events within the calendar - Google Calendar style
  const moveEvent = ({ event, start, end, isAllDay }: any) => {
    if (event && start) {
      console.log("Moving event:", event.id, "to", start, "isAllDay:", isAllDay);
      
      // Create a visual feedback of the drag operation
      toast({
        title: "Taşınıyor...",
        description: "Servis talebi yeni konuma taşınıyor",
      });
      
      // Get technician ID - preserve the current technician
      const technicianId = event.resource?.assigned_to || null;
      
      // Update the service with the new date and preserve technician
      updateEventDate(event.id, start, technicianId)
        .then(success => {
          if (success) {
            toast({
              title: "Servis tarihi güncellendi",
              description: "Servis talebi başarıyla taşındı",
            });
          } else {
            toast({
              title: "Hata",
              description: "Servis tarihi güncellenirken bir hata oluştu",
              variant: "destructive",
            });
          }
        });
    }
  };

  // Handle event selection - completely separate from drag operations
  const handleSelectEvent = (event: any) => {
    // Introduce a slight delay to avoid conflicts with drag operations
    setTimeout(() => {
      onSelectEvent(event as CalendarEvent);
    }, 10);
  };

  return {
    calendarRef,
    handleDropFromOutside,
    moveEvent,
    handleSelectEvent
  };
};
