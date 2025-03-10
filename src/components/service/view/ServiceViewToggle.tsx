
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Table as TableIcon } from "lucide-react";

export type ViewType = "table" | "calendar";

interface ServiceViewToggleProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export const ServiceViewToggle: React.FC<ServiceViewToggleProps> = ({
  activeView,
  setActiveView
}) => {
  return (
    <div className="bg-white border rounded-md p-1 flex items-center shadow-sm">
      <Button 
        variant={activeView === "table" ? "default" : "ghost"} 
        size="sm"
        onClick={() => setActiveView("table")}
        className="px-3"
      >
        <TableIcon className="h-4 w-4 mr-2" />
        Tablo
      </Button>
      <Button 
        variant={activeView === "calendar" ? "default" : "ghost"} 
        size="sm"
        onClick={() => setActiveView("calendar")}
        className="px-3"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Takvim
      </Button>
    </div>
  );
};
