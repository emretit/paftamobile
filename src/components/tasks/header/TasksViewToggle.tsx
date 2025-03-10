
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon, CalendarIcon } from "lucide-react";

export type ViewType = "kanban" | "table" | "calendar";

interface TasksViewToggleProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const TasksViewToggle = ({ activeView, setActiveView }: TasksViewToggleProps) => {
  return (
    <div className="bg-white border rounded-md p-1 flex items-center">
      <Button 
        variant={activeView === "kanban" ? "default" : "ghost"} 
        size="sm"
        onClick={() => setActiveView("kanban")}
        className="px-3"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Kanban
      </Button>
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
        <CalendarIcon className="h-4 w-4 mr-2" />
        Takvim
      </Button>
    </div>
  );
};

export default TasksViewToggle;
