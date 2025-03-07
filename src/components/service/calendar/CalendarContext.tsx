
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { useTechnicians } from "@/hooks/useTechnicians";

type CalendarViewType = "month" | "week" | "day";

interface CalendarContextType {
  currentView: CalendarViewType;
  setCurrentView: (view: CalendarViewType) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  isPanelCollapsed: boolean;
  setIsPanelCollapsed: (collapsed: boolean) => void;
  draggedService: ServiceRequest | null;
  setDraggedService: (service: ServiceRequest | null) => void;
  technicians: { id: string; name: string }[];
  isLoading: boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<CalendarViewType>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [draggedService, setDraggedService] = useState<ServiceRequest | null>(null);
  
  const { technicians, isLoading } = useTechnicians();

  return (
    <CalendarContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentDate,
        setCurrentDate,
        isPanelCollapsed,
        setIsPanelCollapsed,
        draggedService,
        setDraggedService,
        technicians: technicians || [],
        isLoading
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
