
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { CalendarEvent } from "./calendarUtils";
import { useCalendarEventService } from "./calendarEventService";
import moment from "moment";
import "moment/locale/tr";
import { useCalendarConfig } from "./hooks/useCalendarConfig";
import { useCalendarComponents } from "./hooks/useCalendarComponents";
import { useCalendarEventHandlers } from "./hooks/useCalendarEventHandlers";
import { Button } from "@/components/ui/button";

moment.locale("tr");
const localizer = momentLocalizer(moment);

// Create a DnD-enabled Calendar component
const DnDCalendar = withDragAndDrop(Calendar);

interface EventCalendarProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onDropFromOutside?: (date: Date, technicianId: string | null) => void;
  technicians: { id: string; name: string }[];
  setCurrentDate: (date: Date) => void;
  currentView: string;
  onViewChange: (view: string) => void;
  currentDate: Date;
}

export const EventCalendar = ({ 
  events, 
  onSelectEvent,
  onDropFromOutside,
  technicians,
  currentView,
  onViewChange,
  currentDate,
  setCurrentDate
}: EventCalendarProps) => {
  // Use custom hooks for configuration, components and event handlers
  const { 
    eventPropGetter, 
    getEventStart, 
    getEventEnd, 
    resourceIdAccessor, 
    resourceTitleAccessor, 
    messages 
  } = useCalendarConfig();
  
  const components = useCalendarComponents();
  
  const {
    calendarRef,
    handleDropFromOutside,
    moveEvent,
    handleSelectEvent
  } = useCalendarEventHandlers({
    onDropFromOutside,
    onSelectEvent
  });

  // Map technicians to calendar resources format
  const resources = technicians.map(tech => ({
    id: tech.id,
    title: tech.name,
    technicianId: tech.id
  }));

  return (
    <DnDCalendar
      ref={calendarRef}
      localizer={localizer}
      events={events}
      startAccessor={getEventStart}
      endAccessor={getEventEnd}
      style={{ width: '100%', height: '100%' }}
      selectable
      onSelectEvent={handleSelectEvent}
      eventPropGetter={eventPropGetter}
      views={{ month: true, week: true, day: true }}
      messages={messages}
      culture="tr"
      onDropFromOutside={handleDropFromOutside}
      onEventDrop={moveEvent}
      components={components}
      view={currentView as any}
      onView={(view) => onViewChange(view)}
      date={currentDate}
      onNavigate={(date) => setCurrentDate(date)}
      resources={resources}
      resourceIdAccessor={resourceIdAccessor}
      resourceTitleAccessor={resourceTitleAccessor}
    />
  );
};
