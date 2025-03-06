
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { 
  getLocalizer, 
  getEventStyle, 
  calendarMessages, 
  calendarFormats 
} from "../utils/calendarUtils";
import { CalendarEvent } from "../hooks/useTaskCalendar";

interface TaskCalendarViewProps {
  events: CalendarEvent[];
  onEventUpdate: ({ event, start, end }: any) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const TaskCalendarView = ({
  events,
  onEventUpdate,
  onSelectEvent
}: TaskCalendarViewProps) => {
  const localizer = getLocalizer();

  return (
    <div className="h-[700px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ width: '100%', height: '100%' }}
        selectable
        onSelectEvent={onSelectEvent}
        eventPropGetter={getEventStyle}
        views={['month', 'week', 'day']}
        messages={calendarMessages}
        formats={calendarFormats}
        // The following props need to be added with a drag-n-drop library
        // Remove for now as they cause errors
        // onEventDrop={onEventUpdate}
        // onEventResize={onEventUpdate}
      />
    </div>
  );
};
