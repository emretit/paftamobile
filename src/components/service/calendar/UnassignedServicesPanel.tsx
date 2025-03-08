
import React, { useMemo, useState } from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
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
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPriorityColor, getPriorityText } from "@/components/service/utils/priorityUtils";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { useDragAndDrop } from "./useDragAndDrop";
import { getStatusBadge } from "@/components/service/utils/statusUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SortField, SortDirection } from "@/components/tasks/table/types";

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
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Get employee names for assigned technicians
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name");
      
      if (error) throw error;
      return data;
    },
  });
  
  // Filter for only new services (with status "new") and apply sorting
  const newServices = useMemo(() => {
    const filtered = services.filter(service => service.status === 'new');
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case "due_date":
          valueA = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }
      
      const compareResult = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [services, sortField, sortDirection]);

  // Handle sorting when a column header is clicked
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
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

  // Get technician name helper function
  const getTechnicianName = (technicianId?: string) => {
    if (!technicianId || !employees) return "-";
    
    const employee = employees.find((e) => e.id === technicianId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "-";
  };

  // Render sort icon for a column
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
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
          <h3 className="text-sm font-semibold">Yeni Durumdaki Servisler</h3>
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
          {newServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>Durumu "Yeni" olan servis talebi bulunmamaktadır.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Servis No
                      {getSortIcon("title")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Başlık
                      {getSortIcon("title")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center">
                      Müşteri
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("due_date")}
                  >
                    <div className="flex items-center">
                      Tarih
                      {getSortIcon("due_date")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center">
                      Durum
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center">
                      Öncelik
                      {getSortIcon("priority")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newServices.map((service) => (
                  <TableRow 
                    key={service.id}
                    draggable
                    onDragStart={(e) => dragStart(e, service)}
                    className="cursor-grab hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {service.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{service.title}</TableCell>
                    <TableCell>
                      {service.customer_id ? service.customer_id.substring(0, 8) : "-"}
                    </TableCell>
                    <TableCell>
                      {service.due_date
                        ? format(parseISO(service.due_date), "dd MMM yyyy", { locale: tr })
                        : service.created_at 
                          ? format(new Date(service.created_at), 'dd MMM', { locale: tr })
                          : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        service.priority === "high" 
                          ? "border-red-500 text-red-800 bg-red-50" 
                          : service.priority === "medium"
                          ? "border-yellow-500 text-yellow-800 bg-yellow-50"
                          : "border-blue-500 text-blue-800 bg-blue-50"
                      }>
                        {service.priority === "high" 
                          ? "Yüksek" 
                          : service.priority === "medium" 
                          ? "Orta" 
                          : "Düşük"}
                      </Badge>
                    </TableCell>
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
