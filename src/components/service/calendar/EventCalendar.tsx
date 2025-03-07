
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEvent, getEventStyle, getCustomEventWrapper } from "./calendarUtils";
import { useCalendarEventService } from "./calendarEventService";
import { useRef } from "react";
import moment from "moment";
import "moment/locale/tr";

moment.locale("tr");
const localizer = momentLocalizer(moment);

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
  const { handleEventDrop } = useCalendarEventService();
  const calendarRef = useRef<any>(null);

  // Style events based on service request status
  const eventPropGetter = (event: CalendarEvent) => {
    return {
      style: getEventStyle(event.resource.status),
      className: 'cursor-grab'
    };
  };

  // Function to handle drop from outside the calendar
  const handleDropFromOutside = ({ start, end, allDay }: any) => {
    // Get the current resource (technician) if in day or week view
    const technicianId = calendarRef.current?.view?.props?.resource?.technicianId || null;
    
    // Handle the drop event with date and technician
    if (onDropFromOutside) {
      onDropFromOutside(start, technicianId);
    }
  };

  // Customize the event component
  const components = {
    event: ({ event }: { event: CalendarEvent }) => getCustomEventWrapper(event),
    timeSlotWrapper: ({ children }: any) => (
      <div 
        className="h-full w-full bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
      >
        {children}
      </div>
    ),
  };

  // Custom messages for Turkish localization
  const messages = {
    today: 'Bugün',
    previous: 'Önceki',
    next: 'Sonraki',
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
    agenda: 'Ajanda',
    date: 'Tarih',
    time: 'Saat',
    event: 'Etkinlik',
    allDay: 'Tüm Gün',
    noEventsInRange: 'Bu aralıkta servis talebi yok',
  };

  // Resources for day and week views (technicians)
  const resources = technicians.map(tech => ({
    id: tech.id,
    title: tech.name,
    technicianId: tech.id
  }));

  return (
    <Calendar
      ref={calendarRef}
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ width: '100%', height: '100%' }}
      selectable
      onSelectEvent={(event) => onSelectEvent(event)}
      eventPropGetter={eventPropGetter}
      views={{ month: true, week: true, day: true }}
      messages={messages}
      culture="tr"
      resizable
      draggable
      onEventDrop={handleEventDrop}
      onDropFromOutside={handleDropFromOutside}
      droppable={true}
      components={components}
      view={currentView as any}
      onView={(view) => onViewChange(view)}
      date={currentDate}
      onNavigate={(date) => setCurrentDate(date)}
      resources={currentView !== 'month' ? resources : undefined}
      resourceIdAccessor="id"
      resourceTitleAccessor="title"
    />
  );
};
