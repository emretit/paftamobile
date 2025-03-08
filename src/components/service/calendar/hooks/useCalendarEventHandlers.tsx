
import { useRef } from "react";
import { useCalendarEventService } from "../calendarEventService";
import { CalendarEvent } from "../calendarUtils";
import { useCalendar } from "../CalendarContext";

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
  
  // Handle dropping from outside the calendar
  const handleDropFromOutside = ({ start, end, allDay }: any) => {
    const technicianId = calendarRef.current?.view?.props?.resource?.technicianId || null;
    
    if (onDropFromOutside) {
      onDropFromOutside(start, technicianId);
    }
  };

  // Handle moving events within the calendar
  const moveEvent = ({ event, start, end }: any) => {
    if (event && start) {
      updateEventDate(event.id, start);
    }
  };

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    onSelectEvent(event as CalendarEvent);
  };

  return {
    calendarRef,
    handleDropFromOutside,
    moveEvent,
    handleSelectEvent
  };
};
