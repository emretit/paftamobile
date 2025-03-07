
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
  isDraggableEvent?: boolean;
};

export const getEventStyle = (status: ServiceStatus): CSSProperties => {
  const baseStyle: CSSProperties = {
    borderRadius: '4px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
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

// Instead of returning JSX, we'll return a render function
export const getCustomEventWrapper = (event: CalendarEvent) => {
  let statusLabel = '';
  
  switch (event.resource.status) {
    case 'new': statusLabel = 'Yeni'; break;
    case 'assigned': statusLabel = 'Atandı'; break;
    case 'in_progress': statusLabel = 'Devam Ediyor'; break;
    case 'completed': statusLabel = 'Tamamlandı'; break;
    case 'cancelled': statusLabel = 'İptal'; break;
    case 'on_hold': statusLabel = 'Beklemede'; break;
    default: statusLabel = 'Bilinmiyor';
  }

  // Return a render function that the Calendar can use
  return ({ event: _event, title }: any) => {
    return {
      html: `
        <div class="flex flex-col h-full">
          <div class="text-xs font-semibold">${event.title}</div>
          <div class="flex justify-between text-xs mt-1">
            <span>${event.technician_name || 'Atanmamış'}</span>
            <span class="bg-white/20 text-white px-1 rounded text-xs">${statusLabel}</span>
          </div>
        </div>
      `
    };
  };
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
      const technician = technicians.find(t => t.id === request.assigned_to);
      
      return {
        id: request.id,
        title: request.title,
        start: dueDate,
        end: new Date(dueDate.getTime() + 2 * 60 * 60 * 1000), // Add 2 hours for the event duration
        resource: request,
        technician: request.assigned_to,
        technician_name: technician?.name,
        isDraggableEvent: true
      };
    });
};
