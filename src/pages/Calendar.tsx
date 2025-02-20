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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

type EventTypeOption = 'all' | 'technical' | 'sales';
type EventStatusOption = 'all' | 'scheduled' | 'completed' | 'canceled';

interface Filters {
  type: EventTypeOption;
  status: EventStatusOption;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  event_type: 'technical' | 'sales';
  category: string;
  status: 'scheduled' | 'completed' | 'canceled';
  assigned_to?: string;
}

interface EventModalData {
  id?: string;
  title: string;
  start: string;
  end: string;
  description: string;
  event_type: 'technical' | 'sales';
  category: string;
  status: 'scheduled' | 'completed' | 'canceled';
  assigned_to?: string;
}

interface DbEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  event_type: 'technical' | 'sales';
  category: string;
  status: 'scheduled' | 'completed' | 'canceled';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

const EVENT_CATEGORIES = {
  technical: [
    'installation',
    'maintenance',
    'repair',
    'inspection',
    'emergency'
  ]
} as const;

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

  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all'
  });

  const updateFilter = (key: keyof Filters, value: EventTypeOption | EventStatusOption) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchEvents();
    subscribeToEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      let query = supabase.from('events').select('*');
      
      if (filters.type !== 'all') {
        query = query.eq('event_type', filters.type);
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
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

  const subscribeToEvents = () => {
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          fetchEvents();
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
            
            <div className="flex gap-4">
              <Select
                value={filters.type}
                onValueChange={(value: EventTypeOption) => updateFilter('type', value)}
              >
                <SelectTrigger className="w-[180px] bg-red-950/10 border-red-900/20 text-white">
                  <SelectValue placeholder="Etkinlik Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="technical">Teknik</SelectItem>
                  <SelectItem value="sales">Satış</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value: EventStatusOption) => updateFilter('status', value)}
              >
                <SelectTrigger className="w-[180px] bg-red-950/10 border-red-900/20 text-white">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="scheduled">Planlandı</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="canceled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1A1F2C] text-white border-red-900/20">
          <DialogHeader>
            <DialogTitle>{modalData.id ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={modalData.title}
                onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                className="bg-red-950/10 border-red-900/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Başlangıç</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={modalData.start}
                  onChange={(e) => setModalData({ ...modalData, start: e.target.value })}
                  className="bg-red-950/10 border-red-900/20"
                />
              </div>
              <div>
                <Label htmlFor="end">Bitiş</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={modalData.end}
                  onChange={(e) => setModalData({ ...modalData, end: e.target.value })}
                  className="bg-red-950/10 border-red-900/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={modalData.description}
                onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                className="bg-red-950/10 border-red-900/20"
              />
            </div>

            <div>
              <Label htmlFor="event_type">Etkinlik Tipi</Label>
              <Select
                value={modalData.event_type}
                onValueChange={(value: 'technical' | 'sales') => 
                  setModalData({ ...modalData, event_type: value })}
              >
                <SelectTrigger className="bg-red-950/10 border-red-900/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Teknik</SelectItem>
                  <SelectItem value="sales">Satış</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modalData.event_type === 'technical' && (
              <div>
                <Label htmlFor="category">Teknik İşlem Tipi</Label>
                <Select
                  value={modalData.category}
                  onValueChange={(value: string) => 
                    setModalData({ ...modalData, category: value })}
                >
                  <SelectTrigger className="bg-red-950/10 border-red-900/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="installation">Kurulum</SelectItem>
                    <SelectItem value="maintenance">Bakım</SelectItem>
                    <SelectItem value="repair">Onarım</SelectItem>
                    <SelectItem value="inspection">Kontrol</SelectItem>
                    <SelectItem value="emergency">Acil Müdahale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="status">Durum</Label>
              <Select
                value={modalData.status}
                onValueChange={(value: 'scheduled' | 'completed' | 'canceled') => 
                  setModalData({ ...modalData, status: value })}
              >
                <SelectTrigger className="bg-red-950/10 border-red-900/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Planlandı</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="canceled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {modalData.id && (
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
                className="bg-red-700 hover:bg-red-800"
              >
                Sil
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-red-900/20 text-white hover:bg-red-900/20"
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveEvent}
                className="bg-red-900 hover:bg-red-800"
              >
                Kaydet
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
