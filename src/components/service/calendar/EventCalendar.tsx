
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { CalendarEvent, getEventStyle } from "./calendarUtils";
import { useCalendarEventService } from "./calendarEventService";
import { useRef } from "react";
import moment from "moment";
import "moment/locale/tr";

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
  const { updateEventDate } = useCalendarEventService();
  const calendarRef = useRef<any>(null);

  const eventPropGetter = (event: CalendarEvent) => {
    return {
      style: {
        ...getEventStyle(event.resource.status),
        borderRadius: '6px',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      },
      className: 'cursor-grab hover:shadow-md hover:translate-y-[-2px]'
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

  // Custom accessor functions for the calendar
  const getEventStart = (event: CalendarEvent) => event.start;
  const getEventEnd = (event: CalendarEvent) => event.end;

  const customComponents = {
    event: (props: any) => {
      const event = props.event as CalendarEvent;
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
        <div 
          className="flex flex-col h-full p-1.5 transition-all"
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            // Set drag data for the event
            e.dataTransfer.setData('text/plain', JSON.stringify({
              id: event.id,
              title: event.title
            }));
            
            // Create a custom drag image
            const dragImage = document.createElement('div');
            dragImage.innerHTML = `<div style="padding: 8px 12px; background: ${getEventStyle(event.resource.status).backgroundColor}; color: white; border-radius: 4px; font-family: system-ui; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${event.title}</div>`;
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 10, 10);
            
            // Clean up
            setTimeout(() => {
              document.body.removeChild(dragImage);
            }, 0);
          }}
        >
          <div className="text-xs font-semibold truncate">{event.title}</div>
          <div className="flex justify-between text-xs mt-1">
            <span className="truncate max-w-[60%]">{event.technician_name || 'Atanmamış'}</span>
            <span className="bg-white/30 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">{statusLabel}</span>
          </div>
        </div>
      );
    },
    timeSlotWrapper: ({ children }: any) => (
      <div 
        className="h-full w-full bg-gray-50/30 hover:bg-blue-50/30 transition-colors"
      >
        {children}
      </div>
    ),
    toolbar: (props: any) => {
      const { onNavigate, label, onView, localizer, views } = props;
      return (
        <div className="flex items-center justify-between p-2 border-b bg-white">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => onNavigate('PREV')}
            >
              <span className="sr-only">Önceki</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 bg-white hover:bg-blue-50"
              onClick={() => onNavigate('TODAY')}
            >
              Bugün
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => onNavigate('NEXT')}
            >
              <span className="sr-only">Sonraki</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h3 className="text-base font-medium ml-2">{label}</h3>
          </div>
        </div>
      );
    },
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

  // Resource accessor functions
  const resourceIdAccessor = (resource: any) => resource.id;
  const resourceTitleAccessor = (resource: any) => resource.title;

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
      onSelectEvent={(event) => onSelectEvent(event as CalendarEvent)}
      eventPropGetter={eventPropGetter}
      views={{ month: true, week: true, day: true }}
      messages={messages}
      culture="tr"
      onDropFromOutside={handleDropFromOutside}
      // Removed the 'droppable' prop as it's not in the type definitions
      onEventDrop={moveEvent}
      components={customComponents}
      view={currentView as any}
      onView={(view) => onViewChange(view)}
      date={currentDate}
      onNavigate={(date) => setCurrentDate(date)}
      resources={currentView !== 'month' ? resources : undefined}
      resourceIdAccessor={resourceIdAccessor}
      resourceTitleAccessor={resourceTitleAccessor}
    />
  );
};

import { ChevronLeft, ChevronRight } from "lucide-react";
