
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { CalendarEvent } from "./calendarUtils";
import { useCalendarEventService } from "./calendarEventService";
import moment from "moment";
import "moment/locale/tr";
import { useCalendarConfig } from "./hooks/useCalendarConfig";
import { useCalendarComponents } from "./hooks/useCalendarComponents";
import { useCalendarEventHandlers } from "./hooks/useCalendarEventHandlers";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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
  // Use custom hooks for configuration, components and event handlers
  const { 
    eventPropGetter, 
    getEventStart, 
    getEventEnd, 
    resourceIdAccessor, 
    resourceTitleAccessor, 
    formats,
    messages 
  } = useCalendarConfig();
  
  const components = useCalendarComponents();
  
  const {
    calendarRef,
    handleDropFromOutside,
    moveEvent,
    handleSelectEvent
  } = useCalendarEventHandlers({
    onDropFromOutside,
    onSelectEvent
  });

  // Add Google Calendar-like CSS styles
  useEffect(() => {
    // Add custom styles to make it feel more like Google Calendar
    const style = document.createElement('style');
    style.innerHTML = `
      .rbc-calendar {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      }
      .rbc-month-view {
        border-radius: 8px;
        overflow: hidden;
      }
      .rbc-header {
        font-weight: 500;
        padding: 10px 3px;
        border-bottom: 1px solid #e0e0e0;
      }
      .rbc-day-bg {
        transition: background-color 0.2s;
      }
      .rbc-day-bg:hover {
        background-color: #f5f5f5;
      }
      .rbc-off-range-bg {
        background-color: #f9f9f9;
      }
      .rbc-today {
        background-color: #e8f5e9;
      }
      .rbc-event {
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .rbc-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        z-index: 100;
      }
      .rbc-toolbar button {
        color: #5f6368;
        border-radius: 4px;
        border: 1px solid #dadce0;
      }
      .rbc-toolbar button:hover {
        background-color: #f1f3f4;
        color: #202124;
      }
      .rbc-toolbar button.rbc-active {
        background-color: #e8eaed;
        color: #202124;
        box-shadow: none;
      }
      .rbc-event.rbc-selected {
        background-color: transparent !important;
        box-shadow: 0 0 0 2px #4285f4 !important;
        z-index: 200;
      }
      .rbc-day-slot .rbc-event-content {
        padding: 2px 5px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Map technicians to calendar resources format
  const resources = technicians.map(tech => ({
    id: tech.id,
    title: tech.name,
    technicianId: tech.id
  }));

  // Define available views
  const views = {
    month: true,
    week: true,
    day: true,
    agenda: false // disabled agenda view
  };

  return (
    <DnDCalendar
      ref={calendarRef}
      localizer={localizer}
      events={events}
      startAccessor={getEventStart}
      endAccessor={getEventEnd}
      style={{ width: '100%', height: '100%' }}
      selectable
      onSelectEvent={handleSelectEvent}
      eventPropGetter={eventPropGetter}
      views={views}
      messages={messages}
      formats={formats}
      culture="tr"
      onDropFromOutside={handleDropFromOutside}
      onEventDrop={moveEvent}
      onEventResize={moveEvent}
      components={components}
      view={currentView as any}
      onView={(view) => onViewChange(view)}
      date={currentDate}
      onNavigate={(date) => setCurrentDate(date)}
      resources={currentView === 'week' ? resources : undefined} // Only use resources in week view
      resourceIdAccessor={resourceIdAccessor}
      resourceTitleAccessor={resourceTitleAccessor}
      resizable
      showMultiDayTimes
      dayLayoutAlgorithm="no-overlap"
      drilldownView={null} // Disable drill down to prevent conflicts with drag operations
      popup // Enable popup for events
      step={60} // 60 minutes per slot
      timeslots={1} // 1 slot per step
      longPressThreshold={1} // Almost immediate drag recognition (Google Calendar-like)
      draggableAccessor={() => true} // Make all events draggable
    />
  );
};
