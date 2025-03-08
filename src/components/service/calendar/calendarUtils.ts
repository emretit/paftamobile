
import { ServiceRequest, ServiceStatus } from "@/hooks/service/types";
import { CSSProperties } from "react";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ServiceRequest;
  technician?: string;
  technician_name?: string;
  isDraggable?: boolean;
};

export const getEventStyle = (status: ServiceStatus): CSSProperties => {
  const baseStyle: CSSProperties = {
    borderRadius: '6px',
    opacity: 0.9,
    color: 'white',
    border: '0px',
    display: 'block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };
  
  switch (status) {
    case 'new':
      return { ...baseStyle, backgroundColor: '#805AD5' }; // Purple
    case 'assigned':
      return { ...baseStyle, backgroundColor: '#3182CE' }; // Blue
    case 'in_progress':
      return { ...baseStyle, backgroundColor: '#DD6B20' }; // Orange
    case 'completed':
      return { ...baseStyle, backgroundColor: '#38A169' }; // Green
    case 'cancelled':
      return { ...baseStyle, backgroundColor: '#E53E3E' }; // Red
    case 'on_hold':
      return { ...baseStyle, backgroundColor: '#D69E2E' }; // Yellow
    default:
      return { ...baseStyle, backgroundColor: '#718096' }; // Gray
  }
};

export const mapServiceRequestsToEvents = (
  serviceRequests: ServiceRequest[],
  searchQuery: string,
  statusFilter: string | null,
  technicianFilter: string | null,
  technicians: { id: string; name: string }[]
): CalendarEvent[] => {
  if (!serviceRequests) return [];

  let filteredRequests = [...serviceRequests];
  
  // Apply filters
  if (searchQuery) {
    filteredRequests = filteredRequests.filter(request => 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (statusFilter && statusFilter !== 'all') {
    filteredRequests = filteredRequests.filter(request => 
      request.status === statusFilter
    );
  }
  
  if (technicianFilter && technicianFilter !== 'all') {
    filteredRequests = filteredRequests.filter(request => 
      request.assigned_to === technicianFilter
    );
  }
  
  return filteredRequests
    .filter(request => request.due_date) // Only include events with dates
    .map(request => {
      const dueDate = new Date(request.due_date!);
      const technician = technicians.find(t => t.id === request.assigned_to);
      
      // Create a proper end time - for all-day events, set to end of day
      // This ensures proper rendering in all calendar views (day, week, month)
      const startDate = new Date(dueDate);
      let endDate;
      
      // If the time part is all zeros (00:00:00), treat as all-day event
      if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && startDate.getSeconds() === 0) {
        // For all-day events, set end date to the end of the same day
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59);
      } else {
        // For events with specific times, add 2 hours for duration
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      }
      
      return {
        id: request.id,
        title: request.title,
        start: startDate,
        end: endDate,
        resource: request,
        technician: request.assigned_to,
        technician_name: technician?.name,
        isDraggable: true
      };
    });
};
