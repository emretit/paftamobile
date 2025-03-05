
import React from "react";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { RequestStatusCell } from "./RequestStatusCell";
import { RequestPriorityCell } from "./RequestPriorityCell";
import { RequestRowActions } from "./RequestRowActions";
import { ServiceStatus } from "@/hooks/useServiceRequests";

interface ServiceRequestRowProps {
  request: any;
  onOpenDetail: (request: any) => void;
  onStatusChange: (requestId: string, newStatus: ServiceStatus) => void;
  onViewActivities: (requestId: string) => void;
  onAddActivity: (requestId: string) => void;
  onEdit: (request: any) => void;
  onDelete: (request: any) => void;
  onDownloadAttachment: (attachment: any) => void;
  statusOptions: {value: ServiceStatus, label: string}[];
}

export function ServiceRequestRow({
  request,
  onOpenDetail,
  onStatusChange,
  onViewActivities,
  onAddActivity,
  onEdit,
  onDelete,
  onDownloadAttachment,
  statusOptions
}: ServiceRequestRowProps) {
  return (
    <TableRow key={request.id} className="group hover:bg-gray-50 cursor-pointer">
      <TableCell 
        className="font-medium"
        onClick={() => onOpenDetail(request)}
      >
        {request.title}
      </TableCell>
      <TableCell onClick={() => onOpenDetail(request)}>
        {request.service_type}
      </TableCell>
      
      <RequestPriorityCell 
        priority={request.priority} 
        onClick={() => onOpenDetail(request)} 
      />
      
      <RequestStatusCell 
        status={request.status}
        requestId={request.id}
        onStatusChange={onStatusChange}
        statusOptions={statusOptions}
      />
      
      <TableCell onClick={() => onOpenDetail(request)}>
        {request.created_at && format(new Date(request.created_at), 'dd.MM.yyyy')}
      </TableCell>
      
      <RequestRowActions 
        requestId={request.id}
        onViewActivities={onViewActivities}
        onAddActivity={onAddActivity}
        onEdit={onEdit}
        onDelete={onDelete}
        request={request}
        onDownloadAttachment={onDownloadAttachment}
      />
    </TableRow>
  );
}
