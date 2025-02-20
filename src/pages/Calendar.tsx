
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  event_type: 'technical' | 'sales';
  category: string;
}

const Calendar = ({ isCollapsed, setIsCollapsed }: CalendarProps) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
    subscribeToEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) throw error;

      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        description: event.description,
        event_type: event.event_type,
        category: event.category
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Etkinlikler yüklenirken bir hata oluştu."
      });
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          fetchEvents(); // Refresh events when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleEventDrop = async (info: any) => {
    try {
      const { event } = info;
      const { error } = await supabase
        .from('events')
        .update({
          start_time: event.start,
          end_time: event.end
        })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Etkinlik tarihi güncellendi."
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Etkinlik güncellenirken bir hata oluştu."
      });
      fetchEvents(); // Refresh events to revert changes
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 overflow-auto p-8 ml-[68px] lg:ml-[250px]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Takvim</h1>
          
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
              events={events}
              eventDrop={handleEventDrop}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
