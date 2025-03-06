
import { getDaysInMonth, getMonth, getYear, setDate, setMonth, setYear } from "date-fns";
import { format } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import { CalendarEvent } from "../hooks/useTaskCalendar";
import { tr } from 'date-fns/locale/tr';

// Setup localizer for react-big-calendar
export const getLocalizer = () => {
  const locales = {
    'tr': tr
  };
  
  return dateFnsLocalizer({
    format,
    getDaysInMonth,
    getMonth,
    getYear,
    setDate,
    setMonth,
    setYear,
    locales,
  });
};

// Get current date for calendar
export const getCurrentDate = () => {
  return new Date();
};

// Convert task to calendar event
export const taskToCalendarEvent = (task: any): CalendarEvent => {
  if (!task.due_date) {
    // If task has no due date, set it to today
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Noon
    
    return {
      id: task.id,
      title: task.title,
      start: today,
      end: today,
      allDay: true,
      resource: task,
      status: task.status,
      priority: task.priority
    };
  }
  
  const dueDate = new Date(task.due_date);
  dueDate.setHours(12, 0, 0, 0); // Set to noon
  
  return {
    id: task.id,
    title: task.title,
    start: dueDate,
    end: dueDate,
    allDay: true,
    resource: task,
    status: task.status,
    priority: task.priority
  };
};

// Get event style based on task status and priority
export const getEventStyle = (event: CalendarEvent) => {
  if (!event.resource) return {};
  
  const task = event.resource;
  
  // Default styles
  let style: React.CSSProperties = {
    border: '1px solid #fff',
    borderRadius: '4px',
    padding: '2px 4px',
    fontSize: '12px',
  };
  
  // Apply styles based on status
  switch (task.status) {
    case 'completed':
      style.backgroundColor = '#D1FAE5';
      style.color = '#065F46';
      break;
    case 'in_progress':
      style.backgroundColor = '#DBEAFE';
      style.color = '#1E40AF';
      break;
    case 'todo':
      style.backgroundColor = '#F3F4F6';
      style.color = '#1F2937';
      break;
    default:
      // No special styling
      break;
  }
  
  // Apply priority styling
  if (task.priority === 'high') {
    style.borderLeft = '3px solid #EF4444';
  } else if (task.priority === 'medium') {
    style.borderLeft = '3px solid #F59E0B';
  }
  
  // Style for past due dates
  if (task.status !== 'completed' && 
      task.due_date && 
      new Date(task.due_date) < new Date()) {
    style.backgroundColor = '#FEE2E2';
    style.color = '#B91C1C';
  }
  
  return {
    style
  };
};

// Format date for display
export const formatDate = (date: Date | string) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy', { locale: tr });
};

// Calendar messages for Turkish localization
export const calendarMessages = {
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
  allDay: 'Tüm gün',
  noEventsInRange: 'Bu aralıkta görev yok'
};

// Calendar format strings
export const calendarFormats = {
  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'dd MMMM yyyy',
  dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => 
    `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`,
  agendaDateFormat: 'dd MMMM',
  agendaTimeFormat: 'HH:mm',
  agendaTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => 
    `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
};
