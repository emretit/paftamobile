
import React from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { 
  Table, 
  TableBody,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnassignedServicesHeader } from "./components/UnassignedServicesHeader";
import { UnassignedServiceRow } from "./components/UnassignedServiceRow";
import { UnassignedServicesEmpty } from "./components/UnassignedServicesEmpty";
import { useUnassignedServicesSorting } from "./hooks/useUnassignedServicesSorting";
import { useUnassignedServicesDragDrop } from "./hooks/useUnassignedServicesDragDrop";

interface UnassignedServicesPanelProps {
  services: ServiceRequest[];
  isCollapsed: boolean;
  togglePanel: () => void;
  dragStart: (event: React.DragEvent, service: ServiceRequest) => void;
}

export const UnassignedServicesPanel: React.FC<UnassignedServicesPanelProps> = ({
  services,
  isCollapsed,
  togglePanel,
  dragStart
}) => {
  const { newServices, sortField, sortDirection, handleSort } = useUnassignedServicesSorting(services);
  const { handleDragOver, handleDrop } = useUnassignedServicesDragDrop(services);
  
  return (
    <div 
      className={`transition-all duration-300 flex flex-col bg-white border-l border-gray-200 h-full shadow-sm ${
        isCollapsed ? 'w-10' : 'w-80'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between p-3 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium">Yeni Servisler</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
              {newServices.length}
            </span>
          </div>
        )}
        <Button 
          onClick={togglePanel} 
          variant="ghost" 
          size="sm" 
          className="p-1 h-8 w-8 ml-auto rounded-full"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <ScrollArea className="flex-1">
          {newServices.length === 0 ? (
            <UnassignedServicesEmpty />
          ) : (
            <Table>
              <UnassignedServicesHeader 
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
              />
              <TableBody>
                {newServices.map((service) => (
                  <UnassignedServiceRow 
                    key={service.id}
                    service={service}
                    dragStart={dragStart}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      )}
    </div>
  );
};
