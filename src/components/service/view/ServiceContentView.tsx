
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceRequestTable } from "@/components/service/ServiceRequestTable";
import { ServiceRequestCalendar } from "@/components/service/ServiceRequestCalendar";
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
  const getViewComponent = () => {
    switch (activeView) {
      case "calendar":
        return (
          <ServiceRequestCalendar
            searchQuery={searchQuery}
            statusFilter={statusFilter === "all" ? null : statusFilter}
            technicianFilter={technicianFilter === "all" ? null : technicianFilter}
            onSelectRequest={onSelectRequest}
          />
        );
      case "table":
      default:
        return (
          <ServiceRequestTable
            searchQuery={searchQuery}
            statusFilter={statusFilter === "all" ? null : statusFilter}
            technicianFilter={technicianFilter === "all" ? null : technicianFilter}
            onSelectRequest={onSelectRequest}
          />
        );
    }
  };

  return (
    <ScrollArea className={`h-[calc(100vh-280px)] ${activeView === "calendar" ? "pr-4" : ""}`}>
      {getViewComponent()}
    </ScrollArea>
  );
};
