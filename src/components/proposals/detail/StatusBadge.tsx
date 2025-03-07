
import { ProposalStatus } from "@/types/proposal";
import { statusStyles, statusLabels } from "../constants";
import { StatusBadge as GenericStatusBadge } from "@/components/ui/status-badge";

interface StatusBadgeProps {
  status: ProposalStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = statusStyles[status];
  
  return (
    <GenericStatusBadge
      label={statusLabels[status]}
      variant="custom"
      customColors={{
        bg: style.bg,
        text: style.text
      }}
      size="sm"
    />
  );
};
