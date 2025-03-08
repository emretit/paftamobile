
import moment from "moment";
import { CalendarEvent, getEventStyle } from "../calendarUtils";
import { CSSProperties } from "react";

export const useCalendarConfig = () => {
  // Custom accessor functions for the calendar
  const getEventStart = (event: CalendarEvent) => event.start;
  const getEventEnd = (event: CalendarEvent) => event.end;

  // Resource accessor functions
  const resourceIdAccessor = (resource: any) => resource.id;
  const resourceTitleAccessor = (resource: any) => resource.title;

  // Event appearance - Google Calendar style
  const eventPropGetter = (event: CalendarEvent) => {
    const baseStyle = getEventStyle(event.resource.status);
    
    return {
      style: {
        ...baseStyle,
        borderRadius: '4px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        cursor: 'pointer',
        userSelect: 'none' as CSSProperties['userSelect'], // Type assertion to fix the issue
        transition: 'all 0.2s cubic-bezier(.25,.8,.25,1)',
      },
      className: 'google-calendar-event hover:shadow-md hover:z-[999] active:cursor-grabbing'
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
    },
    
    dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }, culture: string, localizer: any) => {
      const startFormat = localizer.format(start, 'DD MMM', culture);
      const endFormat = localizer.format(end, 'DD MMM', culture);
      return `${startFormat} - ${endFormat}`;
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
    showMore: (total: number) => `+${total} daha fazla`
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
