
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DualCalendar from "@/components/calendar/DualCalendar";

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Calendar = ({ isCollapsed, setIsCollapsed }: CalendarProps) => {
  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">Takvim</h1>
        <DualCalendar />
      </main>
    </div>
  );
};

export default Calendar;
