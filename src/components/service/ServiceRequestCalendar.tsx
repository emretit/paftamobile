
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useServiceRequests, ServiceRequest, ServiceStatus } from "@/hooks/useServiceRequests";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, parseISO, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { getDay, getMonth, getYear, startOfWeek } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useToast } from "@/components/ui/use-toast";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ServiceRequest;
};

interface ServiceRequestCalendarProps {
  searchQuery: string;
  statusFilter: string | null;
  technicianFilter: string | null;
  onSelectRequest: (request: ServiceRequest) => void;
}

export const ServiceRequestCalendar = ({
  searchQuery,
  statusFilter,
  technicianFilter,
  onSelectRequest
}: ServiceRequestCalendarProps) => {
  const { data: serviceRequests, isLoading, error } = useServiceRequests();
  const { toast } = useToast();
  
  // Set up calendar localizer with Turkish locale
  const locales = {
    'tr': tr
  };
  
  const localizer = dateFnsLocalizer({
    format,
    parse: (value: string) => parseISO(value),
    startOfWeek: () => startOfWeek(new Date(), { locale: tr }),
    getDay,
    getMonth,
    getYear,
    locales,
  });

  // Convert service requests to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    if (!serviceRequests) return [];

    let filteredRequests = [...serviceRequests];
    
    // Apply filters
    if (searchQuery) {
      filteredRequests = filteredRequests.filter(request => 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filteredRequests = filteredRequests.filter(request => 
        request.status === statusFilter
      );
    }
    
    if (technicianFilter) {
      filteredRequests = filteredRequests.filter(request => 
        request.assigned_to === technicianFilter
      );
    }
    
    return filteredRequests
      .filter(request => request.due_date) // Only include events with dates
      .map(request => {
        const dueDate = new Date(request.due_date!);
        
        return {
          id: request.id,
          title: request.title,
          start: dueDate,
          end: new Date(dueDate.getTime() + 2 * 60 * 60 * 1000), // Add 2 hours for the event duration
          resource: request
        };
      });
  };

  // Style events based on service request status
  const eventStyleGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    };
    
    switch (event.resource.status) {
      case 'new':
        style.backgroundColor = '#805AD5'; // Purple
        break;
      case 'assigned':
        style.backgroundColor = '#3182CE'; // Blue
        break;
      case 'in_progress':
        style.backgroundColor = '#DD6B20'; // Orange
        break;
      case 'completed':
        style.backgroundColor = '#38A169'; // Green
        break;
      case 'cancelled':
        style.backgroundColor = '#E53E3E'; // Red
        break;
      case 'on_hold':
        style.backgroundColor = '#D69E2E'; // Yellow
        break;
      default:
        style.backgroundColor = '#718096'; // Gray
    }
    
    return { style };
  };

  const handleEventDrop = async ({ event, start, end }: any) => {
    try {
      // Update the service request with new date
      const { error } = await supabase
        .from('service_requests')
        .update({ due_date: start.toISOString() })
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast({
        title: "Servis talebi güncellendi",
        description: "Servis tarihi başarıyla güncellendi",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating service date:', error);
      toast({
        title: "Hata",
        description: "Servis tarihi güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Servis talepleri yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Servis talepleri yüklenirken hata oluştu</div>
      </div>
    );
  }

  const events = getCalendarEvents();

  return (
    <div className="bg-white rounded-md border p-4">
      <div className="h-[700px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ width: '100%', height: '100%' }}
          selectable
          onSelectEvent={(event) => onSelectRequest(event.resource)}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          messages={{
            today: 'Bugün',
            previous: 'Önceki',
            next: 'Sonraki',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
            agenda: 'Ajanda',
            date: 'Tarih',
            time: 'Saat',
            event: 'Etkinlik',
            allDay: 'Tüm gün',
            noEventsInRange: 'Bu aralıkta servis talebi yok'
          }}
          culture="tr"
        />
      </div>
    </div>
  );
};
