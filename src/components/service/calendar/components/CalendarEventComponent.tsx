
import React from "react";
import { CalendarEvent } from "../calendarUtils";
import { ClipboardList, Clock, UserCheck, User } from "lucide-react";
import { useCustomerNames } from "@/hooks/useCustomerNames";

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

export const CalendarEventComponent = ({ event }: CalendarEventComponentProps) => {
  const { getCustomerName } = useCustomerNames();
  let statusLabel = '';
  let statusClass = '';
  
  switch (event.resource.status) {
    case 'new': 
      statusLabel = 'Yeni'; 
      statusClass = 'bg-purple-500';
      break;
    case 'assigned': 
      statusLabel = 'Atandı'; 
      statusClass = 'bg-blue-500';
      break;
    case 'in_progress': 
      statusLabel = 'Devam Ediyor'; 
      statusClass = 'bg-orange-500';
      break;
    case 'completed': 
      statusLabel = 'Tamamlandı'; 
      statusClass = 'bg-green-500';
      break;
    case 'cancelled': 
      statusLabel = 'İptal'; 
      statusClass = 'bg-red-500';
      break;
    case 'on_hold': 
      statusLabel = 'Beklemede'; 
      statusClass = 'bg-yellow-500';
      break;
    default: 
      statusLabel = 'Bilinmiyor';
      statusClass = 'bg-gray-500';
  }

  const customerName = getCustomerName(event.resource.customer_id);

  return (
    <div 
      className={`flex flex-col h-full p-1.5 transition-all ${statusClass} rounded-md shadow-sm`}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        // Set drag data for the event
        e.dataTransfer.setData('text/plain', JSON.stringify({
          id: event.id,
          title: event.title
        }));
        
        // Create a custom drag image
        const dragImage = document.createElement('div');
        dragImage.innerHTML = `<div style="padding: 8px 12px; background: ${statusClass}; color: white; border-radius: 4px; font-family: system-ui; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${event.title}</div>`;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 10, 10);
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }}
    >
      <div className="text-xs font-semibold truncate text-white">{event.title}</div>
      
      {/* Customer info */}
      <div className="flex items-center gap-1 text-white/90 text-xs truncate mt-1">
        <User className="h-3 w-3" />
        <span className="truncate">{customerName}</span>
      </div>
      
      <div className="flex justify-between text-xs mt-1">
        {event.technician_name ? (
          <div className="flex items-center gap-1 text-white/90 truncate max-w-[60%]">
            <UserCheck className="h-3 w-3" />
            <span className="truncate">{event.technician_name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-white/90">
            <ClipboardList className="h-3 w-3" />
            <span>Atanmamış</span>
          </div>
        )}
        <span className="bg-white/30 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">
          {statusLabel}
        </span>
      </div>
    </div>
  );
};
