
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceRequestTable } from "@/components/service/ServiceRequestTable";
import { ViewType } from "./ServiceViewToggle";
import { ServiceRequest } from "@/hooks/useServiceRequests";

interface ServiceContentViewProps {
  activeView: ViewType;
  searchQuery: string;
  statusFilter: string;
  technicianFilter: string;
  onSelectRequest: (request: ServiceRequest) => void;
}

export const ServiceContentView: React.FC<ServiceContentViewProps> = ({
  activeView,
  searchQuery,
  statusFilter,
  technicianFilter,
  onSelectRequest
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <ServiceRequestTable
        searchQuery={searchQuery}
        statusFilter={statusFilter === "all" ? null : statusFilter}
        technicianFilter={technicianFilter === "all" ? null : technicianFilter}
        onSelectRequest={onSelectRequest}
      />
    </ScrollArea>
  );
};
