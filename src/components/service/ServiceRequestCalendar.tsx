
import React, { useEffect } from "react";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { mapServiceRequestsToEvents } from "./calendar/calendarUtils";
import { CalendarProvider, useCalendar } from "./calendar/CalendarContext";
import { CalendarControls } from "./calendar/CalendarControls";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

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
  const { data: serviceRequests, isLoading, error, refetch } = useServiceRequests();
  const queryClient = useQueryClient();

  // Realtime subscription to service_requests table changes
  useEffect(() => {
    const channel = supabase
      .channel('service_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests'
        },
        (payload) => {
          console.log('Service request changed:', payload);
          // Refresh data when any change happens
          queryClient.invalidateQueries({ queryKey: ['service-requests'] });
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, queryClient]);

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

  const handleSelectEvent = (event: any) => {
    onSelectRequest(event.resource);
  };

  return (
    <CalendarProvider>
      <Card className="shadow-lg overflow-hidden animate-fade-in">
        <CalendarControls technicianFilter={technicianFilter} />
        
        {serviceRequests && (
          <CalendarEventsWrapper 
            serviceRequests={serviceRequests}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            technicianFilter={technicianFilter}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </Card>
    </CalendarProvider>
  );
};

const CalendarEventsWrapper = ({
  serviceRequests,
  searchQuery,
  statusFilter,
  technicianFilter,
  onSelectEvent
}: {
  serviceRequests: ServiceRequest[];
  searchQuery: string;
  statusFilter: string | null;
  technicianFilter: string | null;
  onSelectEvent: (event: any) => void;
}) => {
  const { technicians } = useCalendar();
  
  const events = mapServiceRequestsToEvents(
    serviceRequests,
    searchQuery,
    statusFilter,
    technicianFilter,
    technicians
  );

  return (
    <CalendarContainer
      events={events}
      services={serviceRequests}
      onSelectEvent={onSelectEvent}
    />
  );
};
