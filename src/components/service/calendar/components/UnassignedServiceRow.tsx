
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { getStatusBadge } from "@/components/service/utils/statusUtils";
import { Clock, AlertTriangle } from "lucide-react";

interface UnassignedServiceRowProps {
  service: ServiceRequest;
  dragStart: (event: React.DragEvent, service: ServiceRequest) => void;
}

export const UnassignedServiceRow: React.FC<UnassignedServiceRowProps> = ({
  service,
  dragStart
}) => {
  // Priority colors
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="border-red-500 text-red-800 bg-red-50 flex gap-1 items-center">
            <AlertTriangle className="h-3 w-3" />
            <span>Yüksek</span>
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-800 bg-yellow-50">
            Orta
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-800 bg-blue-50">
            Düşük
          </Badge>
        );
    }
  };

  return (
    <TableRow 
      key={service.id}
      draggable
      onDragStart={(e) => dragStart(e, service)}
      className="cursor-grab hover:bg-gray-50 transition-colors"
    >
      <TableCell className="font-medium">
        {service.title}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="h-3.5 w-3.5" />
          {service.due_date
            ? format(parseISO(service.due_date), "dd MMM", { locale: tr })
            : service.created_at 
              ? format(new Date(service.created_at), 'dd MMM', { locale: tr })
              : "-"}
        </div>
      </TableCell>
      <TableCell>{getPriorityBadge(service.priority)}</TableCell>
    </TableRow>
  );
};
