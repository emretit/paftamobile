
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CalendarEvent } from "./calendarUtils";

export const useCalendarEventService = () => {
  const { toast } = useToast();

  const updateEventDate = async (eventId: string, newDate: Date) => {
    try {
      // Update the service request with new date
      const { error } = await supabase
        .from('service_requests')
        .update({ due_date: newDate.toISOString() })
        .eq('id', eventId);
        
      if (error) throw error;
      
      toast({
        title: "Servis talebi güncellendi",
        description: "Servis tarihi başarıyla güncellendi",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating service date:', error);
      toast({
        title: "Hata",
        description: "Servis tarihi güncellenirken bir hata oluştu",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleEventDrop = async ({ event, start }: { event: CalendarEvent, start: Date, end: Date }) => {
    return await updateEventDate(event.id, start);
  };

  return {
    updateEventDate,
    handleEventDrop
  };
};
