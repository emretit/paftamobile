
import React from "react";
import { Button } from "@/components/ui/button";
import { Table as TableIcon } from "lucide-react";

export type ViewType = "table";

interface ServiceViewToggleProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export const ServiceViewToggle: React.FC<ServiceViewToggleProps> = ({
  activeView,
  setActiveView
}) => {
  return (
    <div className="bg-white border rounded-md p-1 flex items-center">
      <Button 
        variant={activeView === "table" ? "default" : "ghost"} 
        size="sm"
        onClick={() => setActiveView("table")}
        className="px-3"
      >
        <TableIcon className="h-4 w-4 mr-2" />
        Tablo
      </Button>
    </div>
  );
};
