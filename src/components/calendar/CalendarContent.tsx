
import React from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Event } from '@/types/calendar';

interface CalendarContentProps {
  events: Event[];
  onEventDrop: (info: any) => void;
  onDateSelect: (selectInfo: any) => void;
  onEventClick: (clickInfo: any) => void;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  events,
  onEventDrop,
  onDateSelect,
  onEventClick
}) => {
  return (
    <div className="bg-red-950/10 p-6 rounded-lg border border-red-900/20">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale={trLocale}
        editable={true}
        droppable={true}
        selectable={true}
        events={events}
        eventDrop={onEventDrop}
        select={onDateSelect}
        eventClick={onEventClick}
        height="auto"
        contentHeight="auto"
        aspectRatio={2}
        expandRows={true}
        handleWindowResize={true}
        dayMaxEvents={true}
        themeSystem="standard"
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="19:00:00"
        slotDuration="00:30:00"
        eventColor="#991B1B"
        eventTextColor="#ffffff"
        viewClassNames="bg-red-950/10 text-white"
        dayCellClassNames="text-gray-300 hover:bg-red-900/20"
        slotLabelClassNames="text-gray-400"
        nowIndicatorClassNames="bg-red-500"
        eventClassNames="hover:bg-red-800 transition-colors"
        dayHeaderClassNames="text-gray-300"
        eventDidMount={(info) => {
          tippy(info.el, {
            content: `${info.event.title}\n${info.event.extendedProps.description || ''}`,
            placement: 'top',
            trigger: 'hover',
          });
        }}
      />
    </div>
  );
};

export default CalendarContent;
