
import React from "react";
import { Tag } from "lucide-react";
import { ServiceActivitiesList } from "../ServiceActivitiesList";

interface ServiceActivitiesSectionProps {
  serviceRequestId: string;
}

export const ServiceActivitiesSection: React.FC<ServiceActivitiesSectionProps> = ({ serviceRequestId }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Tag className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-semibold">Servis Aktiviteleri</h3>
      </div>
      
      <ServiceActivitiesList serviceRequestId={serviceRequestId} />
    </div>
  );
};
