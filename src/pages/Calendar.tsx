
import Navbar from "@/components/Navbar";
import DualCalendar from "@/components/calendar/DualCalendar";

interface CalendarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Calendar = ({ isCollapsed, setIsCollapsed }: CalendarProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Takvim</h1>
            <p className="text-gray-600">Teknik servis ve satış etkinliklerini yönetin</p>
          </div>
          <DualCalendar />
        </div>
      </main>
    </div>
  );
};

export default Calendar;
