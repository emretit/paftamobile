
import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useServiceRequests, ServiceRequest } from "@/hooks/useServiceRequests";
import { useTechnicianNames } from "./hooks/useTechnicianNames";
import { Card } from "@/components/ui/card";
import { TECHNICIAN_COLORS } from "@/types/calendar";

// Import additional components
import "./calendar/calendar-styles.css";

const localizer = momentLocalizer(moment);

interface ServiceRequestCalendarProps {
  searchQuery: string;
  statusFilter: string | null;
  technicianFilter: string | null;
  onSelectRequest: (request: ServiceRequest) => void;
}

export const ServiceRequestCalendar: React.FC<ServiceRequestCalendarProps> = ({
  searchQuery,
  statusFilter,
  technicianFilter,
  onSelectRequest
}) => {
  const { data: serviceRequests } = useServiceRequests();
  const { employees, getTechnicianName } = useTechnicianNames();

  // Create an array of technician objects with IDs and colors
  const technicians = useMemo(() => {
    if (!employees) return [];
    
    return employees.map((employee, index) => ({
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      color: TECHNICIAN_COLORS.colors[index % TECHNICIAN_COLORS.colors.length]
    }));
  }, [employees]);

  // Get technician color based on ID
  const getTechnicianColor = (technicianId: string | undefined) => {
    if (!technicianId) return TECHNICIAN_COLORS.default;
    const technician = technicians.find(t => t.id === technicianId);
    return technician?.color || TECHNICIAN_COLORS.default;
  };

  // Filter service requests
  const filteredRequests = useMemo(() => {
    if (!serviceRequests) return [];

    return serviceRequests.filter(request => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (request.description && request.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus = !statusFilter || request.status === statusFilter;
      
      // Filter by technician
      const matchesTechnician = !technicianFilter || request.assigned_to === technicianFilter;
      
      return matchesSearch && matchesStatus && matchesTechnician;
    });
  }, [serviceRequests, searchQuery, statusFilter, technicianFilter]);

  // Convert service requests to calendar events
  const calendarEvents = useMemo(() => {
    return filteredRequests.map(request => {
      // Get date from due_date or created_at
      const eventDate = request.due_date 
        ? new Date(request.due_date)
        : (request.created_at ? new Date(request.created_at) : new Date());
      
      return {
        id: request.id,
        title: request.title,
        start: eventDate,
        end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        resource: request,
        allDay: false,
        technicianId: request.assigned_to,
        status: request.status
      };
    });
  }, [filteredRequests]);

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    const color = getTechnicianColor(event.technicianId);
    const isNewRequest = event.status === "new";
    
    return {
      style: {
        backgroundColor: color,
        borderRadius: '4px',
        color: '#fff',
        border: 'none',
        display: 'block',
        boxShadow: isNewRequest ? '0 0 0 2px #ff4081' : 'none',
        borderLeft: isNewRequest ? '4px solid #ff4081' : 'none',
        opacity: 0.9
      }
    };
  };

  // Handle event click
  const handleEventClick = (event: any) => {
    if (event.resource) {
      onSelectRequest(event.resource);
    }
  };

  if (!serviceRequests) {
    return (
      <Card className="p-6 flex items-center justify-center h-96">
        <p>Servis talepleri yükleniyor...</p>
      </Card>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <Card className="p-6 flex items-center justify-center h-96">
        <p>Servis talebi bulunamadı.</p>
      </Card>
    );
  }

  return (
    <div className="modern-calendar p-6">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        messages={{
          month: 'Ay',
          week: 'Hafta',
          day: 'Gün',
          today: 'Bugün',
          previous: 'Önceki',
          next: 'Sonraki',
          agenda: 'Ajanda',
          date: 'Tarih',
          time: 'Saat',
          event: 'Olay',
          noEventsInRange: 'Bu aralıkta hiç servis talebi yok.'
        }}
      />
    </div>
  );
};
