
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import EventModal from "@/components/calendar/EventModal";
import CalendarFilters from "@/components/calendar/CalendarFilters";
import CalendarContent from "@/components/calendar/CalendarContent";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useEventManagement } from "@/hooks/useEventManagement";
import { EventTypeFilter, EventStatusFilter } from '@/types/calendar';

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Calendar: React.FC<CalendarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');

  const { events, fetchEvents, handleEventDrop } = useCalendarEvents();
  const {
    isModalOpen,
    setIsModalOpen,
    modalData,
    setModalData,
    handleDateSelect,
    handleEventClick,
    handleSaveEvent,
    handleDeleteEvent
  } = useEventManagement();

  useEffect(() => {
    fetchEvents(typeFilter, statusFilter);
  }, [typeFilter, statusFilter]);

  const onEventClick = (clickInfo: any) => {
    handleEventClick(clickInfo, events);
  };

  const onSave = async () => {
    const success = await handleSaveEvent();
    if (success) {
      fetchEvents(typeFilter, statusFilter);
    }
  };

  const onDelete = async () => {
    const success = await handleDeleteEvent();
    if (success) {
      fetchEvents(typeFilter, statusFilter);
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 overflow-auto p-8 ml-[68px] lg:ml-[250px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Teknik Takvim</h1>
            <CalendarFilters
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              onTypeFilterChange={setTypeFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
          
          <CalendarContent
            events={events}
            onEventDrop={handleEventDrop}
            onDateSelect={handleDateSelect}
            onEventClick={onEventClick}
          />

          <EventModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            modalData={modalData}
            setModalData={setModalData}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
