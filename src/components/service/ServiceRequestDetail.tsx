
import React from "react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Import refactored components
import { RequestHeader } from "./detail/RequestHeader";
import { RequestDates } from "./detail/RequestDates";
import { RequestMetadata } from "./detail/RequestMetadata";
import { RequestDescription } from "./detail/RequestDescription";
import { RequestLocation } from "./detail/RequestLocation";
import { CustomerInfo } from "./detail/CustomerInfo";
import { EquipmentInfo } from "./detail/EquipmentInfo";
import { ServiceActivitiesSection } from "./detail/ServiceActivitiesSection";
import { RequestAttachments } from "./detail/RequestAttachments";

interface ServiceRequestDetailProps {
  serviceRequest: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceRequestDetail({ serviceRequest, isOpen, onClose }: ServiceRequestDetailProps) {
  if (!serviceRequest) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[700px] overflow-y-auto">
        <RequestHeader serviceRequest={serviceRequest} />

        <div className="space-y-6">
          <RequestDates 
            createdAt={serviceRequest.created_at} 
            dueDate={serviceRequest.due_date}
          />

          <RequestMetadata 
            priority={serviceRequest.priority} 
            serviceType={serviceRequest.service_type}
          />

          <Separator />

          <RequestDescription description={serviceRequest.description} />
          
          <RequestLocation location={serviceRequest.location} />
          
          <CustomerInfo customerId={serviceRequest.customer_id} />
          
          <EquipmentInfo equipmentId={serviceRequest.equipment_id} />

          <Separator />

          <ServiceActivitiesSection serviceRequestId={serviceRequest.id} />

          {serviceRequest.attachments && serviceRequest.attachments.length > 0 && (
            <>
              <Separator />
              <RequestAttachments attachments={serviceRequest.attachments} />
            </>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
