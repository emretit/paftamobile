
import moment from "moment";
import { CalendarEvent, getEventStyle } from "../calendarUtils";

export const useCalendarConfig = () => {
  // Custom accessor functions for the calendar
  const getEventStart = (event: CalendarEvent) => event.start;
  const getEventEnd = (event: CalendarEvent) => event.end;

  // Resource accessor functions
  const resourceIdAccessor = (resource: any) => resource.id;
  const resourceTitleAccessor = (resource: any) => resource.title;

  // Event appearance
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

  // Calendar messages (translations)
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

  return {
    getEventStart,
    getEventEnd,
    resourceIdAccessor,
    resourceTitleAccessor,
    eventPropGetter,
    messages
  };
};
