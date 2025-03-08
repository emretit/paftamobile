
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { getStatusBadge } from "@/components/service/utils/statusUtils";

interface UnassignedServiceRowProps {
  service: ServiceRequest;
  dragStart: (event: React.DragEvent, service: ServiceRequest) => void;
}

export const UnassignedServiceRow: React.FC<UnassignedServiceRowProps> = ({
  service,
  dragStart
}) => {
  return (
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
  );
};
