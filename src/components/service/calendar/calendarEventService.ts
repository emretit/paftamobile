
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CalendarEvent } from "./calendarUtils";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { useQueryClient } from "@tanstack/react-query";

export const useCalendarEventService = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEventDate = async (eventId: string, newDate: Date, technicianId?: string | null) => {
    try {
      console.log("Updating event:", eventId, "to date:", newDate.toISOString(), "technician:", technicianId);
      
      // Prepare update data
      const updateData: any = { 
        due_date: newDate.toISOString() 
      };
      
      // If technician ID is provided, include it in the update data
      if (technicianId !== undefined) {
        updateData.assigned_to = technicianId;
        
        // If a technician is assigned, update status to "assigned"
        if (technicianId) {
          updateData.status = 'assigned';
        }
      }
      
      // Update the database
      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', eventId);
        
      if (error) throw error;
      
      // Invalidate and refetch service requests data
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      
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
    return await updateEventDate(event.id, start, event.resource?.assigned_to);
  };

  const assignServiceToTechnician = async (
    serviceId: string, 
    technicianId: string, 
    scheduledDate: Date
  ) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          assigned_to: technicianId,
          due_date: scheduledDate.toISOString(),
          status: 'assigned' // Update status when assigned
        })
        .eq('id', serviceId);
        
      if (error) throw error;
      
      // Invalidate and refetch service requests data
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      
      toast({
        title: "Servis atandı",
        description: "Servis talebi teknisyene başarıyla atandı",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error assigning service to technician:', error);
      toast({
        title: "Hata",
        description: "Servis ataması yapılırken bir hata oluştu",
        variant: "destructive",
      });
      return false;
    }
  };

  const unassignService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          assigned_to: null,
          status: 'new' // Reset status to new when unassigned
        })
        .eq('id', serviceId);
        
      if (error) throw error;
      
      // Invalidate and refetch service requests data
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      
      toast({
        title: "Servis atama kaldırıldı",
        description: "Servis talebi atanmamış olarak güncellendi",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error unassigning service:', error);
      toast({
        title: "Hata",
        description: "Servis ataması kaldırılırken bir hata oluştu",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUnassignedServiceDrop = async (
    service: ServiceRequest, 
    technicianId: string,
    date: Date
  ) => {
    return await assignServiceToTechnician(service.id, technicianId, date);
  };

  return {
    updateEventDate,
    handleEventDrop,
    assignServiceToTechnician,
    unassignService,
    handleUnassignedServiceDrop
  };
};
