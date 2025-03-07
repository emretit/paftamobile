
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEvent, getEventStyle } from "./calendarUtils";
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
  const { updateEventDate } = useCalendarEventService();
  const calendarRef = useRef<any>(null);

  const eventPropGetter = (event: CalendarEvent) => {
    return {
      style: getEventStyle(event.resource.status),
      className: 'cursor-grab'
    };
  };

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

  const components = {
    event: ({ event }: { event: CalendarEvent }) => {
      let statusLabel = '';
      
      switch (event.resource.status) {
        case 'new': statusLabel = 'Yeni'; break;
        case 'assigned': statusLabel = 'Atandı'; break;
        case 'in_progress': statusLabel = 'Devam Ediyor'; break;
        case 'completed': statusLabel = 'Tamamlandı'; break;
        case 'cancelled': statusLabel = 'İptal'; break;
        case 'on_hold': statusLabel = 'Beklemede'; break;
        default: statusLabel = 'Bilinmiyor';
      }
    
      return (
        <div className="flex flex-col h-full">
          <div className="text-xs font-semibold">{event.title}</div>
          <div className="flex justify-between text-xs mt-1">
            <span>{event.technician_name || 'Atanmamış'}</span>
            <span className="bg-white/20 text-white px-1 rounded text-xs">{statusLabel}</span>
          </div>
        </div>
      );
    },
    timeSlotWrapper: ({ children }: any) => (
      <div 
        className="h-full w-full bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
      >
        {children}
      </div>
    ),
  };

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
      onDropFromOutside={handleDropFromOutside}
      droppable={true}
      onEventDrop={moveEvent}
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
