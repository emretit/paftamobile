
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getPriorityColor, getPriorityText } from "../utils/priorityUtils";

interface RequestMetadataProps {
  priority: string;
  serviceType: string;
}

export const RequestMetadata: React.FC<RequestMetadataProps> = ({ priority, serviceType }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/40 p-4 rounded-lg">
        <div className="text-sm font-medium text-muted-foreground mb-1">Öncelik</div>
        <Badge 
          variant="secondary" 
          className={`${getPriorityColor(priority)} border`}
        >
          {getPriorityText(priority)}
        </Badge>
      </div>
      <div className="bg-muted/40 p-4 rounded-lg">
        <div className="text-sm font-medium text-muted-foreground mb-1">Servis Tipi</div>
        <span className="text-base">{serviceType}</span>
      </div>
    </div>
  );
};
