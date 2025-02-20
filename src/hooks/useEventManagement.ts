
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { EventModalData, EVENT_CATEGORIES } from '@/types/calendar';

export const useEventManagement = () => {
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

  const handleEventClick = (clickInfo: any, events: any[]) => {
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
      return true;
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Etkinlik kaydedilirken bir hata oluştu."
      });
      return false;
    }
  };

  const handleDeleteEvent = async () => {
    if (!modalData.id) return false;

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
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Etkinlik silinirken bir hata oluştu."
      });
      return false;
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    modalData,
    setModalData,
    handleDateSelect,
    handleEventClick,
    handleSaveEvent,
    handleDeleteEvent
  };
};
