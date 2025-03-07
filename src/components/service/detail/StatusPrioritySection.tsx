
import React from "react";
import { ServiceStatus, ServicePriority } from "@/hooks/useServiceRequests";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusPrioritySectionProps {
  status: ServiceStatus;
  setStatus: (status: ServiceStatus) => void;
  priority: ServicePriority;
  setPriority: (priority: ServicePriority) => void;
}

export const StatusPrioritySection: React.FC<StatusPrioritySectionProps> = ({
  status,
  setStatus,
  priority,
  setPriority
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Durum</label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as ServiceStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="assigned">Atandı</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
            <SelectItem value="on_hold">Beklemede</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Öncelik</label>
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value as ServicePriority)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Düşük</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
            <SelectItem value="urgent">Acil</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
