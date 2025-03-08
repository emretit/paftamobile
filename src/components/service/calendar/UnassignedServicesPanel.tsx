
import React, { useMemo } from "react";
import { ServiceRequest } from "@/hooks/service/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPriorityColor, getPriorityText } from "@/components/service/utils/priorityUtils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { useDragAndDrop } from "./useDragAndDrop";

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
  const { handleDropToUnassigned } = useDragAndDrop();
  const { toast } = useToast();
  
  // Filter for only new unassigned services
  const unassignedServices = useMemo(() => {
    return services.filter(service => 
      !service.assigned_to && 
      service.status === 'new'
    );
  }, [services]);

  // Create a helper function to render priority badge
  const renderPriorityBadge = (priority: string) => {
    return (
      <Badge className={getPriorityColor(priority)}>
        {getPriorityText(priority)}
      </Badge>
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      // Parse the dropped data
      const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // Find the service in the services array
      const droppedService = services.find(service => service.id === droppedData.id);
      
      if (droppedService && droppedService.assigned_to) {
        // Handle unassigning the service
        const success = await handleDropToUnassigned(droppedService);
        
        if (!success) {
          toast({
            title: "Atama kaldırılamadı",
            description: "Servis talebi atanmamış olarak güncellenemedi",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      toast({
        title: "Hata",
        description: "Sürükle bırak işlemi sırasında bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className={`transition-all duration-300 flex flex-col bg-white border-l border-gray-200 h-full ${
        isCollapsed ? 'w-10' : 'w-96'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between p-3 border-b">
        {!isCollapsed && (
          <h3 className="text-sm font-semibold">Atanmamış Servisler</h3>
        )}
        <Button 
          onClick={togglePanel} 
          variant="ghost" 
          size="sm" 
          className="p-1 h-8 w-8 ml-auto"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <ScrollArea className="flex-1">
          {unassignedServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>Durumu "Yeni" olan atanmamış servis talebi bulunmamaktadır.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Öncelik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedServices.map((service) => (
                  <TableRow 
                    key={service.id}
                    draggable
                    onDragStart={(e) => dragStart(e, service)}
                    className="cursor-grab hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {service.id.substring(0, 4)}
                    </TableCell>
                    <TableCell>
                      {service.title.length > 20
                        ? `${service.title.substring(0, 20)}...`
                        : service.title}
                    </TableCell>
                    <TableCell>
                      {service.created_at && format(new Date(service.created_at), 'dd MMM', { locale: tr })}
                    </TableCell>
                    <TableCell>{renderPriorityBadge(service.priority)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      )}
    </div>
  );
};
