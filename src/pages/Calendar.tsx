
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import EventModal from "@/components/calendar/EventModal";
import CalendarFilters from "@/components/calendar/CalendarFilters";
import { Event, EventModalData, DbEvent, EventTypeFilter, EventStatusFilter, EVENT_CATEGORIES } from "@/types/calendar";

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Calendar = ({ isCollapsed, setIsCollapsed }: CalendarProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<EventModalData>({
    title: '',
    start: '',
    end: '',
    description: '',
    event_type: 'technical',
    category: EVENT_CATEGORIES.technical[0],
    status: 'scheduled'
  });

  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, statusFilter]);

  const fetchEvents = async () => {
    try {
      let query = supabase.from('events').select('*');
      
      if (typeFilter !== 'all') {
        query = query.eq('event_type', typeFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedEvents = (data as DbEvent[]).map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        description: event.description || '',
        event_type: event.event_type,
        category: event.category,
        status: event.status,
        assigned_to: event.assigned_to || undefined
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
      fetchEvents();
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setModalData({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      description: '',
      event_type: 'technical',
      category: EVENT_CATEGORIES.technical[0],
      status: 'scheduled'
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setModalData({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        description: event.description || '',
        event_type: event.event_type,
        category: event.category,
        status: event.status,
        assigned_to: event.assigned_to
      });
      setIsModalOpen(true);
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (modalData.id) {
        const { error } = await supabase
          .from('events')
          .update({
            title: modalData.title,
            start_time: modalData.start,
            end_time: modalData.end,
            description: modalData.description,
            event_type: modalData.event_type,
            category: modalData.category,
            status: modalData.status,
            assigned_to: modalData.assigned_to
          })
          .eq('id', modalData.id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Etkinlik güncellendi."
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{
            title: modalData.title,
            start_time: modalData.start,
            end_time: modalData.end,
            description: modalData.description,
            event_type: modalData.event_type,
            category: modalData.category,
            status: modalData.status,
            assigned_to: modalData.assigned_to
          }]);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Etkinlik oluşturuldu."
        });
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Etkinlik kaydedilirken bir hata oluştu."
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!modalData.id) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', modalData.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Etkinlik silindi."
      });
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Etkinlik silinirken bir hata oluştu."
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 overflow-auto p-8 ml-[68px] lg:ml-[250px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Teknik Takvim</h1>
            <CalendarFilters
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              onTypeFilterChange={setTypeFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
          
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
              eventDrop={handleEventDrop}
              select={handleDateSelect}
              eventClick={handleEventClick}
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

          <EventModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            modalData={modalData}
            setModalData={setModalData}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
