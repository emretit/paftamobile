
import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, SaveIcon } from "lucide-react";
import { proposalStatusLabels, statusStyles, primaryProposalStatuses } from "../constants";
import { ProposalStatus } from "@/types/crm";

interface ProposalStatusSelectorProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
  isLoading?: boolean;
}

const ProposalStatusSelector = ({
  currentStatus,
  onStatusChange,
  isLoading = false
}: ProposalStatusSelectorProps) => {
  const [status, setStatus] = useState<ProposalStatus>(currentStatus);
  const [isEditing, setIsEditing] = useState(false);
  const previousStatus = useRef(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as ProposalStatus);
    setIsEditing(true);
  };

  const handleStatusSave = () => {
    onStatusChange(status);
    setIsEditing(false);
    previousStatus.current = status;
  };

  const handleCancel = () => {
    setStatus(previousStatus.current);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {primaryProposalStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    statusStyles[status].split(" ")[0]
                  }`}
                />
                <span>{proposalStatusLabels[status]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isEditing ? (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-8"
          >
            İptal
          </Button>
          <Button
            size="sm"
            onClick={handleStatusSave}
            disabled={isLoading}
            className="h-8"
          >
            <SaveIcon className="mr-1 h-3 w-3" />
            Kaydet
          </Button>
        </div>
      ) : (
        status !== currentStatus && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStatusSave}
            className="h-8"
          >
            <ArrowRightIcon className="h-3 w-3" />
          </Button>
        )
      )}
    </div>
  );
};

export default ProposalStatusSelector;
