
import React from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import Navbar from "@/components/Navbar";
import { tr } from "date-fns/locale";

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Calendar = ({ isCollapsed, setIsCollapsed }: CalendarProps) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 overflow-auto p-8 ml-[68px] lg:ml-[250px]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Takvim</h1>
          
          <div className="bg-red-950/10 p-6 rounded-lg border border-red-900/20">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={tr}
              className="mx-auto bg-red-950/10 border-red-900/20 text-white"
              classNames={{
                head_row: "text-red-200",
                caption: "text-red-100",
                day: "text-gray-100 hover:bg-red-900/30",
                nav_button: "hover:bg-red-900/30",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md",
                day_selected: "bg-red-900 text-white hover:bg-red-800",
                day_today: "bg-red-900/50 text-white",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
