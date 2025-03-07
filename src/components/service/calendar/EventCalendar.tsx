
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEvent, getEventStyle } from "./calendarUtils";
import { getTurkishLocalizer, turkishMessages } from "./calendarLocalizer";
import { useCalendarEventService } from "./calendarEventService";

interface EventCalendarProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const EventCalendar = ({ events, onSelectEvent }: EventCalendarProps) => {
  const localizer = getTurkishLocalizer();
  const { handleEventDrop } = useCalendarEventService();

  // Style events based on service request status
  const eventPropGetter = (event: CalendarEvent) => {
    return {
      style: getEventStyle(event.resource.status)
    };
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ width: '100%', height: '100%' }}
      selectable
      onSelectEvent={(event) => onSelectEvent(event)}
      eventPropGetter={eventPropGetter}
      views={['month', 'week', 'day']}
      messages={turkishMessages}
      culture="tr"
      onEventDrop={handleEventDrop as any}
      draggableAccessor={() => true}
    />
  );
};
