
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

  // Custom formats
  const formats = {
    dayFormat: (date: Date, culture: string, localizer: any) => 
      localizer.format(date, 'ddd DD', culture), // Gün (Pts 12) formatı
    
    timeGutterFormat: (date: Date, culture: string, localizer: any) => 
      localizer.format(date, 'HH:mm', culture), // 24-saat formatı
    
    eventTimeRangeFormat: ({ start, end }: { start: Date, end: Date }, culture: string, localizer: any) => {
      return `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`;
    }
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
    showMore: total => `+${total} daha fazla`
  };

  return {
    getEventStart,
    getEventEnd,
    resourceIdAccessor,
    resourceTitleAccessor,
    eventPropGetter,
    formats,
    messages
  };
};
