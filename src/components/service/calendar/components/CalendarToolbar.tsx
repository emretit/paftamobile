
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarToolbarProps {
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  label: string;
}

export const CalendarToolbar = ({ onNavigate, label }: CalendarToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-white">
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full"
          onClick={() => onNavigate('PREV')}
        >
          <span className="sr-only">Önceki</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 bg-white hover:bg-blue-50"
          onClick={() => onNavigate('TODAY')}
        >
          Bugün
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full"
          onClick={() => onNavigate('NEXT')}
        >
          <span className="sr-only">Sonraki</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-medium ml-2">{label}</h3>
      </div>
    </div>
  );
};
