
import React from "react";
import { useCalendar } from "./CalendarContext";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Layers } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarControlsProps {
  technicianFilter: string | null;
}

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  technicianFilter
}) => {
  const { currentView, setCurrentView, technicians } = useCalendar();

  const getViewLabel = () => {
    switch(currentView) {
      case 'month': return 'Aylık';
      case 'week': return 'Haftalık';
      case 'day': return 'Günlük';
      default: return 'Görünüm';
    }
  };

  return (
    <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Servis Takvimi</h2>
      </div>
      
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 bg-white shadow-sm hover:bg-blue-50 transition-colors">
              <Layers className="h-4 w-4 mr-2 text-blue-500" />
              {getViewLabel()}
              <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="animate-fade-in">
            <DropdownMenuItem onClick={() => setCurrentView('month')}>
              Aylık Görünüm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentView('week')}>
              Haftalık Görünüm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentView('day')}>
              Günlük Görünüm
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {currentView !== 'month' && (
          <Select
            value={technicianFilter || "all"}
            onValueChange={(value) => console.log("Selected technician:", value)}
          >
            <SelectTrigger className="w-[200px] h-9 bg-white shadow-sm">
              <SelectValue placeholder="Teknisyen seçin" />
            </SelectTrigger>
            <SelectContent className="animate-fade-in">
              <SelectItem value="all">Tüm Teknisyenler</SelectItem>
              {technicians?.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
