
import { useState } from "react";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { mapServiceRequestsToEvents, CalendarEvent } from "./calendar/calendarUtils";
import { EventCalendar } from "./calendar/EventCalendar";

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

  const events = mapServiceRequestsToEvents(
    serviceRequests || [],
    searchQuery,
    statusFilter,
    technicianFilter
  );

  const handleSelectEvent = (event: CalendarEvent) => {
    onSelectRequest(event.resource);
  };

  return (
    <div className="bg-white rounded-md border p-4">
      <div className="h-[700px]">
        <EventCalendar 
          events={events} 
          onSelectEvent={handleSelectEvent} 
        />
      </div>
    </div>
  );
};
