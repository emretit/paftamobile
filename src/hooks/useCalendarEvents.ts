
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Event, DbEvent, EventTypeFilter, EventStatusFilter } from '@/types/calendar';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async (typeFilter: EventTypeFilter, statusFilter: EventStatusFilter) => {
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
    }
  };

  return {
    events,
    fetchEvents,
    handleEventDrop
  };
};
