
import { format } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import { CalendarEvent } from "../hooks/useTaskCalendar";
import { tr } from 'date-fns/locale/tr';

// Setup localizer for react-big-calendar
export const getLocalizer = () => {
  const locales = {
    'tr': tr,
  };

  return dateFnsLocalizer({
    format,
    parse: (value: string, format: string) => new Date(value),
    startOfWeek: () => new Date(),
    getDay: (date: Date) => date.getDay(),
    locales,
  });
};

// Get event styling based on priority and status
export const getEventStyle = (event: any) => {
  let backgroundColor;
  let borderColor;
  
  // Set colors based on priority
  switch (event.priority) {
    case 'high':
      backgroundColor = '#FEE2E2';
      borderColor = '#EF4444';
      break;
    case 'medium':
      backgroundColor = '#FEF3C7';
      borderColor = '#F59E0B';
      break;
    case 'low':
      backgroundColor = '#D1FAE5';
      borderColor = '#10B981';
      break;
    default:
      backgroundColor = '#E5E7EB';
      borderColor = '#6B7280';
  }
  
  // Completed tasks have a different style
  if (event.status === 'completed') {
    backgroundColor = '#F3F4F6';
    borderColor = '#9CA3AF';
  }
  
  return {
    style: {
      backgroundColor,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '4px',
      opacity: event.status === 'completed' ? 0.7 : 1,
      color: '#374151',
      fontWeight: 500,
    }
  };
};

// Calendar messages for localization
export const calendarMessages = {
  month: 'Ay',
  week: 'Hafta',
  day: 'Gün',
  today: 'Bugün',
  next: 'İleri',
  previous: 'Geri',
  showMore: (total: number) => `+${total} daha`,
};

// Calendar custom date formats
export const calendarFormats = {
  dayHeaderFormat: (date: Date) => format(date, 'EEEE dd MMMM', { locale: tr }),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
    `${format(start, 'dd MMM', { locale: tr })} - ${format(end, 'dd MMM', { locale: tr })}`,
  timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: tr }),
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
    `${format(start, 'HH:mm', { locale: tr })} - ${format(end, 'HH:mm', { locale: tr })}`,
};
