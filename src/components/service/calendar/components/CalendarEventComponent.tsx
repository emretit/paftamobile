
import React from "react";
import { CalendarEvent } from "../calendarUtils";

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

export const CalendarEventComponent = ({ event }: CalendarEventComponentProps) => {
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

  return (
    <div 
      className="flex flex-col h-full p-1.5 transition-all"
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
        dragImage.innerHTML = `<div style="padding: 8px 12px; background: ${getComputedEventStyle(event)}; color: white; border-radius: 4px; font-family: system-ui; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${event.title}</div>`;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 10, 10);
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }}
    >
      <div className="text-xs font-semibold truncate">{event.title}</div>
      <div className="flex justify-between text-xs mt-1">
        <span className="truncate max-w-[60%]">{event.technician_name || 'Atanmamış'}</span>
        <span className="bg-white/30 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">{statusLabel}</span>
      </div>
    </div>
  );
};

// Helper function to get event background color
const getComputedEventStyle = (event: CalendarEvent) => {
  const status = event.resource.status;
  switch (status) {
    case 'new': return '#805AD5'; // Purple
    case 'assigned': return '#3182CE'; // Blue
    case 'in_progress': return '#DD6B20'; // Orange
    case 'completed': return '#38A169'; // Green
    case 'cancelled': return '#E53E3E'; // Red
    case 'on_hold': return '#D69E2E'; // Yellow
    default: return '#718096'; // Gray
  }
};
